// Kenya Administrative Structure Data
// Counties, Sub-Counties, and Wards

export interface Ward {
  name: string
}

export interface SubCounty {
  name: string
  wards: string[]
}

export interface County {
  name: string
  code: string
  subCounties: SubCounty[]
}

export const KENYA_COUNTIES: County[] = [
  {
    name: "Nairobi",
    code: "047",
    subCounties: [
      {
        name: "Westlands",
        wards: ["Kitisuru", "Parklands/Highridge", "Karura", "Kangemi", "Mountain View"]
      },
      {
        name: "Dagoretti North",
        wards: ["Kilimani", "Kawangware", "Gatina", "Kileleshwa", "Kabiro"]
      },
      {
        name: "Dagoretti South",
        wards: ["Mutuini", "Ngando", "Riruta", "Uthiru/Ruthimitu", "Waithaka"]
      },
      {
        name: "Langata",
        wards: ["Karen", "Nairobi West", "Mugumo-ini", "South C", "Nyayo Highrise"]
      },
      {
        name: "Kibra",
        wards: ["Laini Saba", "Lindi", "Makina", "Woodley/Kenyatta Golf Course", "Sarang'ombe"]
      },
      {
        name: "Roysambu",
        wards: ["Githurai", "kahawa West", "Zimmerman", "Roysambu", "Kahawa"]
      },
      {
        name: "Kasarani",
        wards: ["Clay City", "Mwiki", "Kasarani", "Njiru", "Ruai"]
      },
      {
        name: "Ruaraka",
        wards: ["Babadogo", "Utalii", "Mathare North", "Lucky Summer", "Korogocho"]
      },
      {
        name: "Embakasi South",
        wards: ["Imara Daima", "Kwa Njenga", "Kwa Reuben", "Pipeline", "Kware"]
      },
      {
        name: "Embakasi North",
        wards: ["Kariobangi North", "Dandora Area I", "Dandora Area II", "Dandora Area III", "Dandora Area IV"]
      },
      {
        name: "Embakasi Central",
        wards: ["Kayole North", "Kayole Central", "Kayole South", "Komarock", "Matopeni/Spring Valley"]
      },
      {
        name: "Embakasi East",
        wards: ["Upper Savannah", "Lower Savannah", "Embakasi", "Utawala", "Mihango"]
      },
      {
        name: "Embakasi West",
        wards: ["Umoja I", "Umoja II", "Mowlem", "Kariobangi South"]
      },
      {
        name: "Makadara",
        wards: ["Maringo/Hamza", "Viwandani", "Harambee", "Makongeni"]
      },
      {
        name: "Kamukunji",
        wards: ["Pumwani", "Eastleigh North", "Eastleigh South", "Airbase", "California"]
      },
      {
        name: "Starehe",
        wards: ["Nairobi Central", "Ngara", "Pangani", "Ziwani/Kariokor", "Landimawe", "Nairobi South"]
      },
      {
        name: "Mathare",
        wards: ["Hospital", "Mabatini", "Huruma", "Ngei", "Mlango Kubwa", "Kiamaiko"]
      }
    ]
  },
  {
    name: "Mombasa",
    code: "001",
    subCounties: [
      {
        name: "Changamwe",
        wards: ["Port Reitz", "Kipevu", "Airport", "Changamwe", "Chaani"]
      },
      {
        name: "Jomvu",
        wards: ["Jomvu Kuu", "Miritini", "Mikindani"]
      },
      {
        name: "Kisauni",
        wards: ["Mjambere", "Junda", "Bamburi", "Mwakirunge", "Mtopanga", "Magogoni", "Shanzu"]
      },
      {
        name: "Nyali",
        wards: ["Frere Town", "Ziwa La Ng'ombe", "Mkomani", "Kongowea", "Kadzandani"]
      },
      {
        name: "Likoni",
        wards: ["Mtongwe", "Shika Adabu", "Bofu", "Likoni", "Timbwani"]
      },
      {
        name: "Mvita",
        wards: ["Mji Wa Kale/Makadara", "Tudor", "Tononoka", "Shimanzi/Ganjoni", "Majengo"]
      }
    ]
  },
  {
    name: "Kiambu",
    code: "022",
    subCounties: [
      {
        name: "Gatundu South",
        wards: ["Kiamwangi", "Kiganjo", "Ndarugu", "Ngenda"]
      },
      {
        name: "Gatundu North",
        wards: ["Gituamba", "Githobokoni", "Chania", "Mang'u"]
      },
      {
        name: "Juja",
        wards: ["Murera", "Theta", "Juja", "Witeithie", "Kalimoni"]
      },
      {
        name: "Thika Town",
        wards: ["Township", "Kamenu", "Hospital", "Gatuanyaga", "Ngoliba"]
      },
      {
        name: "Ruiru",
        wards: ["Biashara", "Gatongora", "Kahawa Sukari", "Kahawa Wendani", "Kiuu", "Mwiki", "Mwihoko"]
      },
      {
        name: "Githunguri",
        wards: ["Githunguri", "Githiga", "Ikinu", "Ngewa", "Komothai"]
      },
      {
        name: "Kiambu",
        wards: ["Ting'ang'a", "Ndumberi", "Riabai", "Township"]
      },
      {
        name: "Kiambaa",
        wards: ["Cianda", "Karuri", "Ndenderu", "Muchatha", "Kihara"]
      },
      {
        name: "Kabete",
        wards: ["Gitaru", "Muguga", "Nyadhuna", "Kabete", "Uthiru"]
      },
      {
        name: "Kikuyu",
        wards: ["Karai", "Nachu", "Sigona", "Kikuyu", "Kinoo"]
      },
      {
        name: "Limuru",
        wards: ["Bibirioni", "Limuru Central", "Ndeiya", "Limuru East", "Ngecha Tigoni"]
      },
      {
        name: "Lari",
        wards: ["Kinale", "Kijabe", "Nyanduma", "Kamburu", "Lari/Kirenga"]
      }
    ]
  },
  {
    name: "Kisumu",
    code: "042",
    subCounties: [
      {
        name: "Kisumu East",
        wards: ["Kajulu", "Kolwa East", "Manyatta B", "Nyalenda A"]
      },
      {
        name: "Kisumu West",
        wards: ["Central Kisumu", "Kisumu North", "West Kisumu", "North West Kisumu", "South West Kisumu"]
      },
      {
        name: "Kisumu Central",
        wards: ["Railways", "Migosi", "Shaurimoyo Kaloleni", "Market Milimani", "Kondele"]
      },
      {
        name: "Seme",
        wards: ["West Seme", "Central Seme", "East Seme", "North Seme"]
      },
      {
        name: "Nyando",
        wards: ["West Nyando", "South West Nyando", "North Nyando", "Central Nyando", "East Kano/Wawidhi"]
      },
      {
        name: "Muhoroni",
        wards: ["Miwani", "Ombeyi", "Masogo/Nyang'oma", "Chemelil", "Muhoroni/Koru"]
      },
      {
        name: "Nyakach",
        wards: ["South West Nyakach", "North Nyakach", "Central Nyakach", "West Nyakach", "South East Nyakach"]
      }
    ]
  },
  {
    name: "Nakuru",
    code: "032",
    subCounties: [
      {
        name: "Nakuru Town East",
        wards: ["Biashara", "Kivumbini", "Flamingo", "Menengai West", "Nakuru East"]
      },
      {
        name: "Nakuru Town West",
        wards: ["Barut", "London", "Kaptembwo", "Kapkures", "Rhoda", "Shabaab"]
      },
      {
        name: "Naivasha",
        wards: ["Hells Gate", "Lake View", "Mai Mahiu", "Naivasha East", "Viwandani"]
      },
      {
        name: "Gilgil",
        wards: ["Gilgil", "Elementaita", "Mbaruk/Eburu", "Malewa West", "Nyahururu"]
      },
      {
        name: "Molo",
        wards: ["Mariashoni", "Elburgon", "Molo", "Turi", "Njoro"]
      },
      {
        name: "Njoro",
        wards: ["Mauche", "Kihingo", "Nessuit", "Lare", "Njoro"]
      },
      {
        name: "Rongai",
        wards: ["Menengai", "Mosop", "Solai", "Visoi", "Soin"]
      },
      {
        name: "Subukia",
        wards: ["Subukia", "Waseges", "Kabazi"]
      },
      {
        name: "Bahati",
        wards: ["Dundori", "Kabatini", "Kiamaina", "Lanet/Umoja", "Bahati"]
      },
      {
        name: "Kuresoi South",
        wards: ["Amalo", "Keringet", "Kiptagich", "Tinet"]
      },
      {
        name: "Kuresoi North",
        wards: ["Kiptororo", "Nyota", "Sirikwa", "Kamara"]
      }
    ]
  },
  {
    name: "Machakos",
    code: "016",
    subCounties: [
      {
        name: "Machakos Town",
        wards: ["Kalama", "Kola", "Machakos Central", "Mua", "Mutituni", "Muvuti/Kiima-Kimwe"]
      },
      {
        name: "Mavoko",
        wards: ["Athi River", "Kinanie", "Muthwani", "Syokimau/Mulolongo"]
      },
      {
        name: "Kathiani",
        wards: ["Kathiani Central", "Lower Kaewa/Iveti", "Mitaboni", "Upper Kaewa/Iveti"]
      },
      {
        name: "Kangundo",
        wards: ["Kangundo East", "Kangundo Central", "Kangundo West", "Kangundo North"]
      },
      {
        name: "Matungulu",
        wards: ["Kyeleni", "Matungulu East", "Matungulu North", "Matungulu West", "Tala"]
      },
      {
        name: "Yatta",
        wards: ["Ikombe", "Katangi", "Kithimani", "Matuu", "Ndalani"]
      },
      {
        name: "Mwala",
        wards: ["Kibauni", "Makutano/Mwala", "Masii", "Mbiuni", "Wamunyu"]
      },
      {
        name: "Masinga",
        wards: ["Ekalakala", "Kivaa", "Masinga Central", "Muthesya", "Ndithini"]
      }
    ]
  },
  {
    name: "Uasin Gishu",
    code: "027",
    subCounties: [
      {
        name: "Ainabkoi",
        wards: ["Ainabkoi/Olare", "Kapsoya", "Kaptagat", "Simat/Kapseret"]
      },
      {
        name: "Kapseret",
        wards: ["Kipkenyo", "Ngeria", "Megun", "Langas"]
      },
      {
        name: "Kesses",
        wards: ["Racecourse", "Cheptiret/Kipchamo", "Tulwet/Chuiyat", "Tarakwa"]
      },
      {
        name: "Moiben",
        wards: ["Moiben", "Kimumu", "Sergoit", "Karuna/Meibeki", "Tembelio"]
      },
      {
        name: "Soy",
        wards: ["Soy", "Kuinet/Kapsuswa", "Ziwa", "Kipsomba", "Moisbridge/Kaptembwo"]
      },
      {
        name: "Turbo",
        wards: ["Huruma", "Kiplombe", "Kapsaos", "Tapsagoi", "Ngenyilel"]
      }
    ]
  },
  // Adding more major counties with simplified data
  {
    name: "Kakamega",
    code: "037",
    subCounties: [
      { name: "Butere", wards: ["Butere", "Marama Central", "Marama North", "Marama South", "Marama West"] },
      { name: "Kakamega Central", wards: ["Bukhungu", "Lubao", "Shirere", "Mahiakalo", "Musoli"] },
      { name: "Kakamega East", wards: ["Malava Central", "East Kabras", "Butali/Chegulo", "Manda/Shivanga", "Shirugu/Mugai"] },
      { name: "Kakamega North", wards: ["Chemuche", "Koyonzo", "Likuyani", "Kongoni", "Sinoko"] },
      { name: "Kakamega South", wards: ["Ikolomani", "Idakho South", "Idakho East", "Idakho North", "Idakho Central"] }
    ]
  },
  {
    name: "Meru",
    code: "012",
    subCounties: [
      { name: "Imenti Central", wards: ["Abothuguchi Central", "Abothuguchi West", "Kiagu", "Mitunguu"] },
      { name: "Imenti North", wards: ["Igembe", "Akachiu", "Maua", "Athiru Gaiti", "Ntunene"] },
      { name: "Imenti South", wards: ["Igoji East", "Igoji West", "Nkuene", "Abogeta East", "Abogeta West"] },
      { name: "Tigania East", wards: ["Akithi", "Karama", "Muthara", "Thangatha"] },
      { name: "Tigania West", wards: ["Athwana", "Kianjai", "Nkomo", "Mbeu", "Uruku"] }
    ]
  },
  {
    name: "Nyeri",
    code: "019",
    subCounties: [
      { name: "Kieni", wards: ["Gatarakwa", "Naromoru/Kiamathaga", "Mweiga", "Mugunda", "Thegu River"] },
      { name: "Mathira", wards: ["Magutu", "Iriaini", "Konyu", "Ruguru", "Kirimukuyu"] },
      { name: "Mukurweini", wards: ["Mukurwe-ini West", "Mukurwe-ini Central", "Gikondi"] },
      { name: "Nyeri Town", wards: ["Rware", "Gatitu/Muruguru", "Ruring'u", "Kamakwa/Mukaro"] },
      { name: "Othaya", wards: ["Karima", "Iria-ini", "Mahiga", "Chinga", "Wamagana"] },
      { name: "Tetu", wards: ["Dedan Kimathi", "Wamagana", "Aguthi/Gaaki"] }
    ]
  },
  {
    name: "Eldoret",
    code: "027",
    subCounties: [
      { name: "Eldoret East", wards: ["Langas", "Kapsoya", "Cheptiret", "Kipkenyo"] },
      { name: "Eldoret West", wards: ["Kimumu", "Sergoit", "Karuna", "Moiben"] }
    ]
  }
  // Add more counties as needed - this is a starter set
]

// Helper function to get all county names
export function getCountyNames(): string[] {
  return [...KENYA_COUNTIES.map((county) => county.name)].sort()
}

// Helper function to get sub-counties for a specific county
export function getSubCounties(countyName: string): string[] {
  const normalizedCounty = countyName.trim().toLowerCase()
  const county = KENYA_COUNTIES.find((c) => c.name.trim().toLowerCase() === normalizedCounty)
  return county ? [...county.subCounties.map((sc) => sc.name)].sort() : []
}

// Helper function to get wards for a specific sub-county
export function getWards(countyName: string, subCountyName: string): string[] {
  const normalizedCounty = countyName.trim().toLowerCase()
  const normalizedSubCounty = subCountyName.trim().toLowerCase()
  const county = KENYA_COUNTIES.find((c) => c.name.trim().toLowerCase() === normalizedCounty)
  if (!county) return []
  
  const subCounty = county.subCounties.find((sc) => sc.name.trim().toLowerCase() === normalizedSubCounty)
  return subCounty ? [...subCounty.wards].sort() : []
}

// All 47 counties for quick reference
export const ALL_KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet",
  "Embu", "Garissa", "Homa Bay", "Isiolo", "Kajiado",
  "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga",
  "Kisii", "Kisumu", "Kitui", "Kwale", "Laikipia",
  "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua",
  "Nyeri", "Samburu", "Siaya", "Taita-Taveta", "Tana River",
  "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga",
  "Wajir", "West Pokot"
].sort()
