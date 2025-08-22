'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save,
  BarChart3,
  PieChart,
  LineChart,
  Table,
  Calendar,
  Filter,
  Settings,
  DragHandleDots2,
  Database,
  Columns,
  SortAsc,
  Group
} from 'lucide-react'

interface ReportField {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'boolean'
  table: string
  displayName: string
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

interface ReportFilter {
  id: string
  field: string
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'between'
  value: string | number | Date
  value2?: string | number | Date // for between operator
}

interface ReportVisualization {
  type: 'table' | 'bar_chart' | 'line_chart' | 'pie_chart' | 'metric_card'
  title: string
  fields: string[]
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  limit?: number
}

interface CustomReport {
  id?: string
  name: string
  description: string
  category: string
  fields: ReportField[]
  filters: ReportFilter[]
  visualizations: ReportVisualization[]
  schedule?: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    recipients: string[]
  }
}

interface CustomReportBuilderProps {
  availableFields: ReportField[]
  onSave?: (report: CustomReport) => void
  existingReport?: CustomReport
}

export function CustomReportBuilder({ 
  availableFields, 
  onSave, 
  existingReport 
}: CustomReportBuilderProps) {
  const [report, setReport] = useState<CustomReport>(existingReport || {
    name: '',
    description: '',
    category: 'custom',
    fields: [],
    filters: [],
    visualizations: []
  })

  const [activeTab, setActiveTab] = useState('fields')
  const [previewOpen, setPreviewOpen] = useState(false)

  const addField = (field: ReportField) => {
    if (!report.fields.find(f => f.id === field.id)) {
      setReport(prev => ({
        ...prev,
        fields: [...prev.fields, field]
      }))
    }
  }

  const removeField = (fieldId: string) => {
    setReport(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId)
    }))
  }

  const addFilter = () => {
    const newFilter: ReportFilter = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: ''
    }
    setReport(prev => ({
      ...prev,
      filters: [...prev.filters, newFilter]
    }))
  }

  const updateFilter = (filterId: string, updates: Partial<ReportFilter>) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.map(f => 
        f.id === filterId ? { ...f, ...updates } : f
      )
    }))
  }

  const removeFilter = (filterId: string) => {
    setReport(prev => ({
      ...prev,
      filters: prev.filters.filter(f => f.id !== filterId)
    }))
  }

  const addVisualization = (type: ReportVisualization['type']) => {
    const newViz: ReportVisualization = {
      type,
      title: `New ${type.replace('_', ' ')}`,
      fields: []
    }
    setReport(prev => ({
      ...prev,
      visualizations: [...prev.visualizations, newViz]
    }))
  }

  const updateVisualization = (index: number, updates: Partial<ReportVisualization>) => {
    setReport(prev => ({
      ...prev,
      visualizations: prev.visualizations.map((viz, i) => 
        i === index ? { ...viz, ...updates } : viz
      )
    }))
  }

  const removeVisualization = (index: number) => {
    setReport(prev => ({
      ...prev,
      visualizations: prev.visualizations.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    onSave?.(report)
  }

  const getVisualizationIcon = (type: ReportVisualization['type']) => {
    switch (type) {
      case 'table':
        return Table
      case 'bar_chart':
        return BarChart3
      case 'line_chart':
        return LineChart
      case 'pie_chart':
        return PieChart
      default:
        return BarChart3
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Custom Report Builder</h2>
          <p className="text-muted-foreground">
            Build custom reports with drag-and-drop functionality
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report Preview</DialogTitle>
                <DialogDescription>
                  Preview of "{report.name || 'Untitled Report'}"
                </DialogDescription>
              </DialogHeader>
              <ReportPreview report={report} />
            </DialogContent>
          </Dialog>
          <Button onClick={handleSave} disabled={!report.name || report.fields.length === 0}>
            <Save className="h-4 w-4 mr-2" />
            Save Report
          </Button>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={report.name}
                  onChange={(e) => setReport(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter report name"
                />
              </div>

              <div>
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  value={report.description}
                  onChange={(e) => setReport(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this report shows"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="report-category">Category</Label>
                <Select 
                  value={report.category} 
                  onValueChange={(value) => setReport(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="occupancy">Occupancy</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Builder Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="fields">
                    <Database className="h-4 w-4 mr-2" />
                    Fields
                  </TabsTrigger>
                  <TabsTrigger value="filters">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </TabsTrigger>
                  <TabsTrigger value="visualizations">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Charts
                  </TabsTrigger>
                  <TabsTrigger value="schedule">
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="fields" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Available Fields */}
                    <div>
                      <h4 className="font-medium mb-3">Available Fields</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {availableFields.map((field) => (
                          <div
                            key={field.id}
                            className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                            onClick={() => addField(field)}
                          >
                            <div>
                              <p className="text-sm font-medium">{field.displayName}</p>
                              <p className="text-xs text-muted-foreground">
                                {field.table}.{field.name} ({field.type})
                              </p>
                            </div>
                            <Plus className="h-4 w-4 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Selected Fields */}
                    <div>
                      <h4 className="font-medium mb-3">Selected Fields ({report.fields.length})</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {report.fields.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-8">
                            No fields selected
                          </p>
                        ) : (
                          report.fields.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <DragHandleDots2 className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">{field.displayName}</p>
                                  <p className="text-xs text-muted-foreground">{field.type}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeField(field.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="filters" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Report Filters</h4>
                    <Button onClick={addFilter} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Filter
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {report.filters.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No filters configured
                      </p>
                    ) : (
                      report.filters.map((filter) => (
                        <div key={filter.id} className="p-3 border rounded-lg">
                          <div className="grid grid-cols-4 gap-3">
                            <Select
                              value={filter.field}
                              onValueChange={(value) => updateFilter(filter.id, { field: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select field" />
                              </SelectTrigger>
                              <SelectContent>
                                {report.fields.map((field) => (
                                  <SelectItem key={field.id} value={field.id}>
                                    {field.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Select
                              value={filter.operator}
                              onValueChange={(value: any) => updateFilter(filter.id, { operator: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="not_equals">Not Equals</SelectItem>
                                <SelectItem value="greater_than">Greater Than</SelectItem>
                                <SelectItem value="less_than">Less Than</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="between">Between</SelectItem>
                              </SelectContent>
                            </Select>

                            <Input
                              value={filter.value.toString()}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              placeholder="Value"
                            />

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFilter(filter.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="visualizations" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Visualizations</h4>
                    <div className="flex gap-2">
                      <Button onClick={() => addVisualization('table')} size="sm" variant="outline">
                        <Table className="h-4 w-4 mr-2" />
                        Table
                      </Button>
                      <Button onClick={() => addVisualization('bar_chart')} size="sm" variant="outline">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Bar Chart
                      </Button>
                      <Button onClick={() => addVisualization('pie_chart')} size="sm" variant="outline">
                        <PieChart className="h-4 w-4 mr-2" />
                        Pie Chart
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {report.visualizations.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No visualizations added
                      </p>
                    ) : (
                      report.visualizations.map((viz, index) => {
                        const VizIcon = getVisualizationIcon(viz.type)
                        return (
                          <Card key={index}>
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <VizIcon className="h-5 w-5" />
                                  <Input
                                    value={viz.title}
                                    onChange={(e) => updateVisualization(index, { title: e.target.value })}
                                    className="font-medium"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeVisualization(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label className="text-xs">Fields</Label>
                                  <Select
                                    value={viz.fields[0] || ''}
                                    onValueChange={(value) => updateVisualization(index, { fields: [value] })}
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue placeholder="Select field" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {report.fields.map((field) => (
                                        <SelectItem key={field.id} value={field.id}>
                                          {field.displayName}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {viz.type !== 'metric_card' && (
                                  <div>
                                    <Label className="text-xs">Group By</Label>
                                    <Select
                                      value={viz.groupBy || ''}
                                      onValueChange={(value) => updateVisualization(index, { groupBy: value })}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Optional" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {report.fields.map((field) => (
                                          <SelectItem key={field.id} value={field.id}>
                                            {field.displayName}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="enable-schedule"
                        checked={report.schedule?.enabled || false}
                        onChange={(e) => setReport(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            enabled: e.target.checked,
                            frequency: 'weekly',
                            time: '09:00',
                            recipients: []
                          }
                        }))}
                      />
                      <Label htmlFor="enable-schedule">Enable scheduled reports</Label>
                    </div>

                    {report.schedule?.enabled && (
                      <div className="space-y-4 p-4 border rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={report.schedule.frequency}
                              onValueChange={(value: any) => setReport(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule!, frequency: value }
                              }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Time</Label>
                            <Input
                              type="time"
                              value={report.schedule.time}
                              onChange={(e) => setReport(prev => ({
                                ...prev,
                                schedule: { ...prev.schedule!, time: e.target.value }
                              }))}
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Recipients (comma separated emails)</Label>
                          <Textarea
                            value={report.schedule.recipients.join(', ')}
                            onChange={(e) => setReport(prev => ({
                              ...prev,
                              schedule: { 
                                ...prev.schedule!, 
                                recipients: e.target.value.split(',').map(email => email.trim()) 
                              }
                            }))}
                            placeholder="john@example.com, jane@example.com"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ReportPreview({ report }: { report: CustomReport }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{report.name || 'Untitled Report'}</h3>
        <p className="text-muted-foreground">{report.description}</p>
      </div>

      {report.fields.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No fields selected for preview</p>
        </div>
      ) : (
        <div className="space-y-6">
          {report.visualizations.map((viz, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-base">{viz.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center bg-muted/20 rounded-lg">
                  <div className="text-center">
                    {React.createElement(getVisualizationIcon(viz.type), { 
                      className: "h-12 w-12 text-muted-foreground mx-auto mb-4" 
                    })}
                    <p className="text-muted-foreground">{viz.type.replace('_', ' ')} preview</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Data will be displayed here when report is generated
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
