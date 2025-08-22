import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Upload, 
  Folder, 
  Share2,
  Clock,
  Users,
  HardDrive,
  TrendingUp,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Archive,
  Shield,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatFileSize } from '@/lib/format'

interface DocumentStats {
  totalDocuments: number
  totalSize: number
  documentsByCategory: Array<{
    category: string
    count: number
    size: number
  }>
  documentsByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  recentUploads: number
  sharedDocuments: number
  storageUsed: number
  storageLimit: number
}

interface RecentDocument {
  id: string
  filename: string
  originalName: string
  category: string
  size: number
  uploadedAt: Date
  uploadedBy: string
  entityType: string
  entityId: string
  version: number
  isShared: boolean
}

interface DocumentManagementDashboardProps {
  stats: DocumentStats
  recentDocuments: RecentDocument[]
  categories: string[]
}

export function DocumentManagementDashboard({ 
  stats, 
  recentDocuments, 
  categories 
}: DocumentManagementDashboardProps) {
  const {
    totalDocuments,
    totalSize,
    documentsByCategory,
    documentsByType,
    recentUploads,
    sharedDocuments,
    storageUsed,
    storageLimit
  } = stats

  const storagePercentage = (storageUsed / storageLimit) * 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Document Management</h2>
          <p className="text-muted-foreground">
            Organize, share, and manage all your property documents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/documents/shared">
              <Share2 className="h-4 w-4 mr-2" />
              Shared Documents
            </Link>
          </Button>
          <Button asChild>
            <Link href="/documents/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Documents
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{recentUploads} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(storageUsed)}</div>
            <Progress value={storagePercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {storagePercentage.toFixed(1)}% of {formatFileSize(storageLimit)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{sharedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Active shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Document categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Document Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentsByType.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' :
                          index === 1 ? 'bg-green-500' :
                          index === 2 ? 'bg-yellow-500' :
                          index === 3 ? 'bg-purple-500' : 'bg-gray-500'
                        }`} />
                        <span className="font-medium capitalize">{type.type}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{type.count}</p>
                        <p className="text-xs text-muted-foreground">{type.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Storage by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Storage by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documentsByCategory.slice(0, 5).map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{category.category}</span>
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(category.size)}
                        </span>
                      </div>
                      <Progress 
                        value={(category.size / totalSize) * 100} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        {category.count} documents
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/documents/upload">
                    <Upload className="h-6 w-6" />
                    <span>Upload Files</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/documents/organize">
                    <Folder className="h-6 w-6" />
                    <span>Organize</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/documents/shared">
                    <Share2 className="h-6 w-6" />
                    <span>Share</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" asChild>
                  <Link href="/documents/archive">
                    <Archive className="h-6 w-6" />
                    <span>Archive</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Documents</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/documents">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent documents</p>
                  </div>
                ) : (
                  recentDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.originalName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatFileSize(doc.size)}</span>
                            <span>•</span>
                            <span className="capitalize">{doc.category}</span>
                            {doc.version > 1 && (
                              <>
                                <span>•</span>
                                <span>v{doc.version}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.isShared && (
                          <Badge variant="outline" className="text-xs">
                            <Share2 className="h-3 w-3 mr-1" />
                            Shared
                          </Badge>
                        )}
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(doc.uploadedAt.toISOString())}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            by {doc.uploadedBy}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentsByCategory.map((category, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Folder className="h-8 w-8 text-blue-500" />
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                      <h3 className="font-medium capitalize">{category.category}</h3>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(category.size)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Upload trends chart</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Document upload activity over time
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Analytics */}
            <Card>
              <CardHeader>
                <CardTitle>Access Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span>Total Views</span>
                    </div>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Unique Viewers</span>
                    </div>
                    <span className="font-medium">89</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-4 w-4 text-muted-foreground" />
                      <span>Shares Created</span>
                    </div>
                    <span className="font-medium">{sharedDocuments}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Security Events</span>
                    </div>
                    <span className="font-medium">0</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
