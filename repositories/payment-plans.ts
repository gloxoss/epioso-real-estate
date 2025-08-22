import { BaseRepository, PaginationOptions, PaginatedResult } from './base'
import { Prisma, PaymentPlanStatus } from '@prisma/client'
import { addMonths, addDays } from 'date-fns'

export interface PaymentPlanFilters {
  search?: string
  status?: PaymentPlanStatus
  dealId?: string
  agentId?: string
  dateFrom?: Date
  dateTo?: Date
}

export interface PaymentPlanCreateData {
  dealId: string
  status?: PaymentPlanStatus
  totalAmount: number
  downPayment: number
  installmentCount: number
  frequency?: string
  startDate: Date
  lateFeeAmount?: number | null
  gracePeriodDays?: number
  notes?: string | null
}

export interface PaymentPlanUpdateData {
  status?: PaymentPlanStatus
  totalAmount?: number
  downPayment?: number
  installmentCount?: number
  frequency?: string
  startDate?: Date
  lateFeeAmount?: number | null
  gracePeriodDays?: number
  notes?: string | null
}

export type PaymentPlanWithDetails = Prisma.PaymentPlanGetPayload<{
  include: {
    deal: {
      select: {
        id: true
        dealNumber: true
        salePrice: true
        unit: {
          select: {
            id: true
            unitNumber: true
            property: {
              select: {
                id: true
                name: true
              }
            }
          }
        }
        buyer: {
          select: {
            id: true
            name: true
            email: true
            phone: true
          }
        }
        agent: {
          select: {
            id: true
            user: {
              select: {
                id: true
                name: true
                email: true
              }
            }
          }
        }
      }
    }
    milestones: {
      orderBy: {
        milestoneNumber: 'asc'
      }
      include: {
        invoice: {
          select: {
            id: true
            number: true
            status: true
            total: true
          }
        }
      }
    }
  }
}>

export type PaymentMilestoneWithDetails = Prisma.PaymentMilestoneGetPayload<{
  include: {
    paymentPlan: {
      select: {
        id: true
        deal: {
          select: {
            id: true
            dealNumber: true
            unit: {
              select: {
                unitNumber: true
                property: {
                  select: {
                    name: true
                  }
                }
              }
            }
            buyer: {
              select: {
                name: true
                email: true
              }
            }
          }
        }
      }
    }
    invoice: {
      select: {
        id: true
        number: true
        status: true
        total: true
      }
    }
  }
}>

class PaymentPlansRepository extends BaseRepository {
  async list(
    organizationId: string,
    filters: PaymentPlanFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResult<PaymentPlanWithDetails>> {
    const { page, perPage, skip, take } = this.buildPagination(pagination)
    const orderBy = this.buildOrderBy(pagination.sort, pagination.dir)

    const where: Prisma.PaymentPlanWhereInput = {
      organizationId,
    }

    if (filters.search) {
      where.OR = [
        { deal: { dealNumber: { contains: filters.search, mode: 'insensitive' } } },
        { deal: { buyer: { name: { contains: filters.search, mode: 'insensitive' } } } },
        { deal: { unit: { unitNumber: { contains: filters.search, mode: 'insensitive' } } } },
      ]
    }

    if (filters.status) {
      where.status = filters.status
    }

    if (filters.dealId) {
      where.dealId = filters.dealId
    }

    if (filters.agentId) {
      where.deal = { agentId: filters.agentId }
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {}
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo
      }
    }

    const [plans, total] = await Promise.all([
      this.prisma.paymentPlan.findMany({
        where,
        include: {
          deal: {
            select: {
              id: true,
              dealNumber: true,
              salePrice: true,
              unit: {
                select: {
                  id: true,
                  unitNumber: true,
                  property: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
              buyer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  phone: true,
                },
              },
              agent: {
                select: {
                  id: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
          milestones: {
            orderBy: {
              milestoneNumber: 'asc',
            },
            include: {
              invoice: {
                select: {
                  id: true,
                  number: true,
                  status: true,
                  total: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.paymentPlan.count({ where }),
    ])

    return {
      data: plans,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    }
  }

  async findById(id: string, organizationId: string): Promise<PaymentPlanWithDetails | null> {
    return this.prisma.paymentPlan.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        deal: {
          select: {
            id: true,
            dealNumber: true,
            salePrice: true,
            unit: {
              select: {
                id: true,
                unitNumber: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            agent: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        milestones: {
          orderBy: {
            milestoneNumber: 'asc',
          },
          include: {
            invoice: {
              select: {
                id: true,
                number: true,
                status: true,
                total: true,
              },
            },
          },
        },
      },
    })
  }

  async create(organizationId: string, data: PaymentPlanCreateData): Promise<PaymentPlanWithDetails> {
    // Verify deal exists and belongs to organization
    const deal = await this.prisma.salesDeal.findFirst({
      where: { id: data.dealId, organizationId },
    })
    if (!deal) {
      throw new Error('Deal not found or access denied')
    }

    // Calculate remaining amount and installment amount
    const remainingAmount = data.totalAmount - data.downPayment
    const installmentAmount = remainingAmount / data.installmentCount

    const plan = await this.prisma.paymentPlan.create({
      data: {
        ...data,
        organizationId,
        remainingAmount,
        installmentAmount,
      },
      include: {
        deal: {
          select: {
            id: true,
            dealNumber: true,
            salePrice: true,
            unit: {
              select: {
                id: true,
                unitNumber: true,
                property: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            buyer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            agent: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        milestones: {
          orderBy: {
            milestoneNumber: 'asc',
          },
          include: {
            invoice: {
              select: {
                id: true,
                number: true,
                status: true,
                total: true,
              },
            },
          },
        },
      },
    })

    // Create payment milestones
    await this.createMilestones(plan.id, data)

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'payment_plan',
      entityId: plan.id,
      action: 'created',
      payload: { 
        dealId: data.dealId, 
        totalAmount: data.totalAmount,
        installmentCount: data.installmentCount 
      },
    })

    return plan
  }

  private async createMilestones(paymentPlanId: string, planData: PaymentPlanCreateData): Promise<void> {
    const milestones = []
    const installmentAmount = (planData.totalAmount - planData.downPayment) / planData.installmentCount

    for (let i = 1; i <= planData.installmentCount; i++) {
      let dueDate = planData.startDate
      
      // Calculate due date based on frequency
      if (planData.frequency === 'monthly') {
        dueDate = addMonths(planData.startDate, i - 1)
      } else if (planData.frequency === 'quarterly') {
        dueDate = addMonths(planData.startDate, (i - 1) * 3)
      } else {
        // Default to monthly
        dueDate = addMonths(planData.startDate, i - 1)
      }

      milestones.push({
        paymentPlanId,
        milestoneNumber: i,
        amount: installmentAmount,
        dueDate,
      })
    }

    await this.prisma.paymentMilestone.createMany({
      data: milestones,
    })
  }

  async getOverdueMilestones(organizationId: string): Promise<PaymentMilestoneWithDetails[]> {
    const today = new Date()
    
    return this.prisma.paymentMilestone.findMany({
      where: {
        paymentPlan: { organizationId },
        isPaid: false,
        dueDate: { lt: today },
      },
      include: {
        paymentPlan: {
          select: {
            id: true,
            deal: {
              select: {
                id: true,
                dealNumber: true,
                unit: {
                  select: {
                    unitNumber: true,
                    property: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                buyer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    })
  }

  async markMilestonePaid(
    milestoneId: string,
    organizationId: string,
    paidAmount: number,
    paidDate: Date = new Date()
  ): Promise<PaymentMilestoneWithDetails> {
    // Verify milestone belongs to organization
    const milestone = await this.prisma.paymentMilestone.findFirst({
      where: {
        id: milestoneId,
        paymentPlan: { organizationId },
      },
    })

    if (!milestone) {
      throw new Error('Payment milestone not found or access denied')
    }

    const updatedMilestone = await this.prisma.paymentMilestone.update({
      where: { id: milestoneId },
      data: {
        isPaid: true,
        paidDate,
        paidAmount,
      },
      include: {
        paymentPlan: {
          select: {
            id: true,
            deal: {
              select: {
                id: true,
                dealNumber: true,
                unit: {
                  select: {
                    unitNumber: true,
                    property: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
                buyer: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        invoice: {
          select: {
            id: true,
            number: true,
            status: true,
            total: true,
          },
        },
      },
    })

    // Log activity
    await this.logActivity(organizationId, {
      entityType: 'payment_milestone',
      entityId: milestoneId,
      action: 'paid',
      payload: { paidAmount, paidDate },
    })

    return updatedMilestone
  }
}

export const paymentPlansRepo = new PaymentPlansRepository()
