// Daraja API (M-Pesa) Integration Library

interface DarajaTokenResponse {
  access_token: string
  expires_in: string
}

interface STKPushRequest {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  TransactionType: string
  Amount: number
  PartyA: string
  PartyB: string
  PhoneNumber: string
  CallBackURL: string
  AccountReference: string
  TransactionDesc: string
}

interface STKPushResponse {
  MerchantRequestID: string
  CheckoutRequestID: string
  ResponseCode: string
  ResponseDescription: string
  CustomerMessage: string
}

interface STKQueryRequest {
  BusinessShortCode: string
  Password: string
  Timestamp: string
  CheckoutRequestID: string
}

interface STKQueryResponse {
  ResponseCode: string
  ResponseDescription: string
  MerchantRequestID: string
  CheckoutRequestID: string
  ResultCode: string
  ResultDesc: string
}

class DarajaAPI {
  private baseURL: string
  private consumerKey: string
  private consumerSecret: string
  private shortCode: string
  private passKey: string

  constructor() {
    this.baseURL = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke'
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || ''
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''
    this.shortCode = process.env.MPESA_SHORTCODE || ''
    this.passKey = process.env.MPESA_PASSKEY || ''

    if (!this.consumerKey || !this.consumerSecret || !this.shortCode || !this.passKey) {
      throw new Error('Missing required M-Pesa environment variables')
    }
  }

  // Generate access token
  async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64')
    
    const response = await fetch(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`)
    }

    const data: DarajaTokenResponse = await response.json()
    return data.access_token
  }

  // Generate password for STK Push
  private generatePassword(): { password: string; timestamp: string } {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3)
    const password = Buffer.from(`${this.shortCode}${this.passKey}${timestamp}`).toString('base64')
    
    return { password, timestamp }
  }

  // Format phone number to required format (254XXXXXXXXX)
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any spaces, dashes, or other characters
    let cleaned = phoneNumber.replace(/\D/g, '')
    
    // Handle different formats
    if (cleaned.startsWith('254')) {
      return cleaned
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1)
    } else if (cleaned.length === 9) {
      return '254' + cleaned
    }
    
    throw new Error('Invalid phone number format')
  }

  // Initiate STK Push
  async initiateSTKPush(params: {
    phoneNumber: string
    amount: number
    accountReference: string
    transactionDesc: string
    callbackURL: string
  }): Promise<STKPushResponse> {
    const accessToken = await this.getAccessToken()
    const { password, timestamp } = this.generatePassword()
    const formattedPhone = this.formatPhoneNumber(params.phoneNumber)

    const requestBody: STKPushRequest = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount), // Ensure amount is integer
      PartyA: formattedPhone,
      PartyB: this.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: params.callbackURL,
      AccountReference: params.accountReference,
      TransactionDesc: params.transactionDesc
    }

    const response = await fetch(`${this.baseURL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`STK Push failed: ${response.statusText}`)
    }

    const data: STKPushResponse = await response.json()
    
    if (data.ResponseCode !== '0') {
      throw new Error(`STK Push failed: ${data.ResponseDescription}`)
    }

    return data
  }

  // Query STK Push status
  async querySTKPush(checkoutRequestID: string): Promise<STKQueryResponse> {
    const accessToken = await this.getAccessToken()
    const { password, timestamp } = this.generatePassword()

    const requestBody: STKQueryRequest = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID
    }

    const response = await fetch(`${this.baseURL}/mpesa/stkpushquery/v1/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`STK Query failed: ${response.statusText}`)
    }

    const data: STKQueryResponse = await response.json()
    return data
  }
}

export const darajaAPI = new DarajaAPI()
export type { STKPushResponse, STKQueryResponse }