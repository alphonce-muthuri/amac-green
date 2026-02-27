// KCB Buni API Client
export interface KCBBuniConfig {
  baseUrl: string
  tokenUrl: string
  clientId: string
  clientSecret: string
  routeCode: string
  orgShortCode?: string
  orgPassKey?: string
  useSharedShortCode: boolean
}

export interface STKPushRequest {
  amount: string
  callbackUrl: string
  invoiceNumber: string
  phoneNumber: string
  transactionDescription: string
  orgPassKey?: string
  orgShortCode?: string
  sharedShortCode: boolean
}

export interface STKPushResponse {
  header: {
    statusCode: string
    statusDescription: string
  }
  response: {
    CheckoutRequestID: string
    CustomerMessage: string
    MerchantRequestID: string
    ResponseCode: number
    ResponseDescription: string
  }
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export class KCBBuniClient {
  private config: KCBBuniConfig
  private accessToken: string | null = null
  private tokenExpiry: number = 0

  constructor(config: KCBBuniConfig) {
    this.config = config
  }

  private async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const credentials = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')
      
      console.log('[KCB_BUNI] Requesting token from:', this.config.tokenUrl)
      
      const response = await fetch(this.config.tokenUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials'
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[KCB_BUNI] Token request failed:', response.status, response.statusText, errorText)
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
      }

      const tokenData: TokenResponse = await response.json()
      console.log('[KCB_BUNI] Token received successfully, expires in:', tokenData.expires_in, 'seconds')
      
      this.accessToken = tokenData.access_token
      // Set expiry to 90% of actual expiry to ensure we refresh before it expires
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000 * 0.9)
      
      return this.accessToken
    } catch (error) {
      console.error('Error getting access token:', error)
      throw new Error('Failed to authenticate with KCB Buni API')
    }
  }

  async initiateSTKPush(request: Omit<STKPushRequest, 'orgPassKey' | 'orgShortCode' | 'sharedShortCode'>): Promise<STKPushResponse> {
    try {
      const token = await this.getAccessToken()
      
      // Generate unique message ID
      const messageId = `${Date.now()}_KCBOrg_${Math.random().toString(36).substr(2, 9)}`
      
      const stkRequest: STKPushRequest = {
        ...request,
        orgPassKey: this.config.useSharedShortCode ? "" : this.config.orgPassKey || "",
        orgShortCode: this.config.useSharedShortCode ? "" : this.config.orgShortCode || "",
        sharedShortCode: this.config.useSharedShortCode
      }

      console.log('[KCB_BUNI] Initiating STK Push:', {
        amount: stkRequest.amount,
        phoneNumber: stkRequest.phoneNumber,
        invoiceNumber: stkRequest.invoiceNumber,
        sharedShortCode: stkRequest.sharedShortCode
      })

      const response = await fetch(`${this.config.baseUrl}/stkpush`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'routeCode': this.config.routeCode,
          'operation': 'STKPush',
          'messageId': messageId
        },
        body: JSON.stringify(stkRequest)
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[KCB_BUNI] STK Push failed:', response.status, errorText)
        throw new Error(`STK Push request failed: ${response.status} ${response.statusText}`)
      }

      const result: STKPushResponse = await response.json()
      
      console.log('[KCB_BUNI] STK Push response:', {
        statusCode: result.header.statusCode,
        statusDescription: result.header.statusDescription,
        responseCode: result.response.ResponseCode,
        checkoutRequestID: result.response.CheckoutRequestID
      })

      return result
    } catch (error) {
      console.error('[KCB_BUNI] STK Push error:', error)
      throw error
    }
  }

  // Utility method to format phone number for Kenya
  static formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.substring(1)
    } else if (cleaned.length === 9) {
      return '254' + cleaned
    }
    
    return cleaned
  }

  // Utility method to validate phone number
  static isValidKenyanPhone(phone: string): boolean {
    const formatted = this.formatPhoneNumber(phone)
    return /^254[17]\d{8}$/.test(formatted)
  }
}

// Create singleton instance
let kcbBuniClient: KCBBuniClient | null = null

export function getKCBBuniClient(): KCBBuniClient {
  if (!kcbBuniClient) {
    const config: KCBBuniConfig = {
      baseUrl: process.env.KCB_BUNI_BASE_URL || 'https://uat.buni.kcbgroup.com/mm/api/request/1.0.0',
      tokenUrl: process.env.KCB_BUNI_TOKEN_URL || 'https://accounts.buni.kcbgroup.com/oauth2/token',
      clientId: process.env.KCB_BUNI_CLIENT_ID || '',
      clientSecret: process.env.KCB_BUNI_CLIENT_SECRET || '',
      routeCode: process.env.KCB_BUNI_ROUTE_CODE || '207',
      orgShortCode: process.env.KCB_BUNI_ORG_SHORT_CODE || '',
      orgPassKey: process.env.KCB_BUNI_ORG_PASS_KEY || '',
      useSharedShortCode: process.env.KCB_BUNI_USE_SHARED_SHORT_CODE === 'true' || true
    }

    if (!config.clientId || !config.clientSecret) {
      throw new Error('KCB Buni credentials not configured. Please set KCB_BUNI_CLIENT_ID and KCB_BUNI_CLIENT_SECRET environment variables.')
    }

    kcbBuniClient = new KCBBuniClient(config)
  }

  return kcbBuniClient
}