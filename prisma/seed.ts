import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed for Es Bensouda Real Estate...')

  // Clear existing data
  await prisma.paymentMilestone.deleteMany()
  await prisma.paymentPlan.deleteMany()
  await prisma.commission.deleteMany()
  await prisma.viewingAppointment.deleteMany()
  await prisma.leadActivity.deleteMany()
  await prisma.salesDeal.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.salesAgent.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.maintenanceTicket.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.document.deleteMany()
  await prisma.unitStatusHistory.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.property.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.member.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Cleared existing data')

  // Create Organization
  const organization = await prisma.organization.create({
    data: {
      name: 'Immobilier Es Bensouda'
    }
  })

  console.log('✅ Organization created')

  // Create Users
  const users = await Promise.all([
    // Admin
    prisma.user.create({
      data: {
        name: 'Ahmed Benali',
        email: 'ahmed.benali@immobilier-esbensouda.ma',
        password: await hash('password123', 12),
        emailVerified: new Date(),
      }
    }),
    // Sales Agents
    prisma.user.create({
      data: {
        name: 'Fatima Zahra Alami',
        email: 'fatima.alami@immobilier-esbensouda.ma',
        password: await hash('password123', 12),
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        name: 'Youssef Tazi',
        email: 'youssef.tazi@immobilier-esbensouda.ma',
        password: await hash('password123', 12),
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        name: 'Aicha Benjelloun',
        email: 'aicha.benjelloun@immobilier-esbensouda.ma',
        password: await hash('password123', 12),
        emailVerified: new Date(),
      }
    }),
    prisma.user.create({
      data: {
        name: 'Omar Chraibi',
        email: 'omar.chraibi@immobilier-esbensouda.ma',
        password: await hash('password123', 12),
        emailVerified: new Date(),
      }
    })
  ])

  console.log('✅ Users created')

  // Create Organization Members
  await Promise.all([
    prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: users[0].id,
        role: 'owner'
      }
    }),
    prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: users[1].id,
        role: 'manager'
      }
    }),
    prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: users[2].id,
        role: 'manager'
      }
    }),
    prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: users[3].id,
        role: 'manager'
      }
    }),
    prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: users[4].id,
        role: 'accountant'
      }
    })
  ])

  console.log('✅ Organization members created')

  // Create Sales Agents
  const salesAgents = await Promise.all([
    prisma.salesAgent.create({
      data: {
        organizationId: organization.id,
        userId: users[1].id,
        licenseNumber: 'AGT-MKN-2024-001',
        commissionRate: 0.025, // 2.5%
        territory: 'Es Bensouda Nord',
        isActive: true,
        totalSales: 2450000, // 2.45M MAD
        totalCommission: 61250
      }
    }),
    prisma.salesAgent.create({
      data: {
        organizationId: organization.id,
        userId: users[2].id,
        licenseNumber: 'AGT-MKN-2024-002',
        commissionRate: 0.03, // 3%
        territory: 'Es Bensouda Sud',
        isActive: true,
        totalSales: 1890000, // 1.89M MAD
        totalCommission: 56700
      }
    }),
    prisma.salesAgent.create({
      data: {
        organizationId: organization.id,
        userId: users[3].id,
        licenseNumber: 'AGT-MKN-2024-003',
        commissionRate: 0.028, // 2.8%
        territory: 'Es Bensouda Centre',
        isActive: true,
        totalSales: 3200000, // 3.2M MAD
        totalCommission: 89600
      }
    })
  ])

  console.log('✅ Sales agents created')

  // Create Properties with authentic Moroccan addresses
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        organizationId: organization.id,
        name: 'Résidence Al Andalous',
        address: '15 Rue Ibn Sina, Es Bensouda, Meknès',
        description: 'Résidence moderne avec vue sur les jardins, proche de toutes commodités',
        attributes: {
          type: 'residential',
          yearBuilt: 2020,
          floors: 4,
          elevator: true,
          parking: true,
          garden: true,
          security: true
        }
      }
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        name: 'Villa Dar Essalam',
        address: '42 Avenue Mohammed V, Es Bensouda, Meknès',
        description: 'Villa traditionnelle marocaine rénovée avec patio et jardin',
        attributes: {
          type: 'villa',
          yearBuilt: 1995,
          renovated: 2022,
          floors: 2,
          garden: true,
          pool: true,
          garage: true
        }
      }
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        name: 'Centre Commercial Meknes Plaza',
        address: '8 Boulevard Allal Ben Abdellah, Es Bensouda, Meknès',
        description: 'Centre commercial moderne avec espaces commerciaux et bureaux',
        attributes: {
          type: 'commercial',
          yearBuilt: 2018,
          floors: 3,
          elevator: true,
          parking: true,
          airConditioning: true
        }
      }
    }),
    prisma.property.create({
      data: {
        organizationId: organization.id,
        name: 'Résidence Yasmine',
        address: '23 Rue Al Massira, Es Bensouda, Meknès',
        description: 'Appartements familiaux dans quartier calme et résidentiel',
        attributes: {
          type: 'residential',
          yearBuilt: 2019,
          floors: 5,
          elevator: true,
          parking: true,
          playground: true
        }
      }
    })
  ])

  console.log('✅ Properties created')

  // Create Units for each property
  const units = []

  // Résidence Al Andalous - 12 apartments
  for (let i = 1; i <= 12; i++) {
    const floor = Math.ceil(i / 3)
    const unitNumber = `${floor}${String.fromCharCode(64 + ((i - 1) % 3) + 1)}`
    const unit = await prisma.unit.create({
      data: {
        propertyId: properties[0].id,
        unitNumber,
        status: i <= 8 ? 'available' : 'sold',
        salePrice: 850000 + (i * 25000), // 850K to 1.15M MAD
        isForSale: true,
        isForRent: false,
        assignedAgentId: salesAgents[i % 3].id,
        attributes: {
          type: 'apartment',
          bedrooms: i % 3 === 0 ? 3 : 2,
          bathrooms: i % 3 === 0 ? 2 : 1,
          area: i % 3 === 0 ? 120 : 85,
          balcony: true,
          furnished: false
        }
      }
    })
    units.push(unit)
  }

  // Villa Dar Essalam - Single villa
  const villa = await prisma.unit.create({
    data: {
      propertyId: properties[1].id,
      unitNumber: 'VILLA',
      status: 'available',
      salePrice: 2800000, // 2.8M MAD
      isForSale: true,
      isForRent: false,
      assignedAgentId: salesAgents[2].id,
      attributes: {
        type: 'villa',
        bedrooms: 5,
        bathrooms: 3,
        area: 350,
        garden: true,
        pool: true,
        garage: true
      }
    }
  })
  units.push(villa)

  // Commercial spaces
  for (let i = 1; i <= 8; i++) {
    const unit = await prisma.unit.create({
      data: {
        propertyId: properties[2].id,
        unitNumber: `COM-${i.toString().padStart(2, '0')}`,
        status: i <= 5 ? 'available' : 'sold',
        salePrice: 450000 + (i * 50000), // 450K to 800K MAD
        rentAmount: 8000 + (i * 1000), // 8K to 15K MAD/month
        isForSale: true,
        isForRent: true,
        assignedAgentId: salesAgents[i % 3].id,
        attributes: {
          type: 'commercial',
          area: 60 + (i * 10),
          parking: true,
          airConditioning: true
        }
      }
    })
    units.push(unit)
  }

  console.log('✅ Units created')

  // Create Moroccan Contacts (Buyers)
  const contacts = await Promise.all([
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        type: 'buyer',
        name: 'Hassan El Amrani',
        email: 'hassan.elamrani@gmail.com',
        phone: '+212 661 234 567',
        address: 'Hay Riad, Rabat',
        leadSource: 'website',
        budget: 950000,
        timeline: 'Dans les 3 mois',
        preferences: {
          propertyType: 'apartment',
          bedrooms: 2,
          maxBudget: 1000000,
          location: 'Es Bensouda'
        },
        isQualified: true
      }
    }),
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        type: 'buyer',
        name: 'Khadija Benkirane',
        email: 'khadija.benkirane@outlook.com',
        phone: '+212 662 345 678',
        address: 'Agdal, Rabat',
        leadSource: 'referral',
        budget: 1200000,
        timeline: 'Dans les 6 mois',
        preferences: {
          propertyType: 'apartment',
          bedrooms: 3,
          maxBudget: 1300000
        },
        isQualified: true
      }
    }),
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        type: 'buyer',
        name: 'Mohamed Tazi',
        email: 'mohamed.tazi@yahoo.fr',
        phone: '+212 663 456 789',
        address: 'Gueliz, Marrakech',
        leadSource: 'social_media',
        budget: 2500000,
        timeline: 'Immédiatement',
        preferences: {
          propertyType: 'villa',
          bedrooms: 4,
          maxBudget: 3000000,
          features: ['garden', 'pool']
        },
        isQualified: true
      }
    }),
    prisma.contact.create({
      data: {
        organizationId: organization.id,
        type: 'buyer',
        name: 'Amina Chraibi',
        email: 'amina.chraibi@gmail.com',
        phone: '+212 664 567 890',
        address: 'Maarif, Casablanca',
        leadSource: 'advertising',
        budget: 600000,
        timeline: 'Dans l\'année',
        preferences: {
          propertyType: 'commercial',
          area: 80,
          maxBudget: 700000
        },
        isQualified: false
      }
    })
  ])

  console.log('✅ Contacts created')

  // Create Leads in various pipeline stages
  const leads = await Promise.all([
    // New lead
    prisma.lead.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[0].id,
        unitId: units[2].id, // Apartment in Al Andalous
        assignedAgentId: salesAgents[0].id,
        status: 'qualified',
        source: 'website',
        score: 85,
        budget: 950000,
        timeline: 'Dans les 3 mois',
        notes: 'Client très intéressé, visite prévue la semaine prochaine',
        nextFollowUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next week
      }
    }),
    // Viewing scheduled
    prisma.lead.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[1].id,
        unitId: units[5].id,
        assignedAgentId: salesAgents[1].id,
        status: 'viewing_scheduled',
        source: 'referral',
        score: 90,
        budget: 1200000,
        timeline: 'Dans les 6 mois',
        notes: 'Recommandé par un client existant, très motivé',
        nextFollowUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // In 3 days
      }
    }),
    // Offer made
    prisma.lead.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[2].id,
        unitId: villa.id,
        assignedAgentId: salesAgents[2].id,
        status: 'offer_made',
        source: 'social_media',
        score: 95,
        budget: 2500000,
        timeline: 'Immédiatement',
        notes: 'Offre de 2.6M MAD soumise, en attente de réponse',
        nextFollowUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // In 2 days
      }
    }),
    // New commercial lead
    prisma.lead.create({
      data: {
        organizationId: organization.id,
        contactId: contacts[3].id,
        unitId: units[units.length - 2].id, // Commercial space
        assignedAgentId: salesAgents[0].id,
        status: 'contacted',
        source: 'advertising',
        score: 60,
        budget: 600000,
        timeline: 'Dans l\'année',
        notes: 'Intéressé par espace commercial pour salon de coiffure'
      }
    })
  ])

  console.log('✅ Leads created')

  // Create Sales Deals
  const deals = await Promise.all([
    // Completed sale
    prisma.salesDeal.create({
      data: {
        organizationId: organization.id,
        leadId: leads[0].id,
        unitId: units[8].id, // Sold apartment
        buyerId: contacts[0].id,
        agentId: salesAgents[0].id,
        dealNumber: 'DEAL-2024-001',
        saleType: 'full_payment',
        salePrice: 1050000,
        contractDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        closingDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        status: 'completed',
        downPayment: 1050000,
        notes: 'Vente finalisée avec succès, client très satisfait'
      }
    }),
    // Active deal with payment plan
    prisma.salesDeal.create({
      data: {
        organizationId: organization.id,
        leadId: leads[1].id,
        unitId: units[9].id,
        buyerId: contacts[1].id,
        agentId: salesAgents[1].id,
        dealNumber: 'DEAL-2024-002',
        saleType: 'installment_plan',
        salePrice: 1175000,
        contractDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        status: 'contract_signed',
        downPayment: 350000,
        financingAmount: 825000,
        notes: 'Plan de paiement sur 24 mois approuvé'
      }
    })
  ])

  console.log('✅ Sales deals created')

  // Create Payment Plan for the installment deal
  const paymentPlan = await prisma.paymentPlan.create({
    data: {
      organizationId: organization.id,
      dealId: deals[1].id,
      status: 'active',
      totalAmount: 1175000,
      downPayment: 350000,
      remainingAmount: 825000,
      installmentCount: 24,
      installmentAmount: 34375, // 825000 / 24
      frequency: 'monthly',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Start next month
      lateFeeAmount: 500,
      gracePeriodDays: 5,
      notes: 'Plan de paiement mensuel sur 24 mois'
    }
  })

  console.log('✅ Payment plan created')

  console.log('✅ Database seeded successfully!')
  console.log('🏢 Organization: Immobilier Es Bensouda')
  console.log('📍 Location: Es Bensouda, Meknès, Morocco')
  console.log('🏠 Properties: 4 properties with 22 units')
  console.log('👥 Contacts: 4 Moroccan buyers')
  console.log('🎯 Leads: 4 leads in various pipeline stages')
  console.log('💰 Deals: 2 sales deals (1 completed, 1 active)')
  console.log('')
  console.log('Login credentials:')
  console.log('Admin: ahmed.benali@immobilier-esbensouda.ma / password123')
  console.log('Agent: fatima.alami@immobilier-esbensouda.ma / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
