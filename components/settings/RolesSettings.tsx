'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Edit, Trash2, Shield } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Permission {
  id: string
  name: string
  description: string
  category: string
}

interface Role {
  id: string
  name: string
  description: string
  permissions: string[]
  userCount: number
  isDefault: boolean
}

const mockPermissions: Permission[] = [
  { id: 'properties.view', name: 'View Properties', description: 'Can view property information', category: 'Properties' },
  { id: 'properties.create', name: 'Create Properties', description: 'Can add new properties', category: 'Properties' },
  { id: 'properties.edit', name: 'Edit Properties', description: 'Can modify property details', category: 'Properties' },
  { id: 'properties.delete', name: 'Delete Properties', description: 'Can remove properties', category: 'Properties' },
  { id: 'tenants.view', name: 'View Tenants', description: 'Can view tenant information', category: 'Tenants' },
  { id: 'tenants.create', name: 'Create Tenants', description: 'Can add new tenants', category: 'Tenants' },
  { id: 'tenants.edit', name: 'Edit Tenants', description: 'Can modify tenant details', category: 'Tenants' },
  { id: 'billing.view', name: 'View Billing', description: 'Can view invoices and payments', category: 'Billing' },
  { id: 'billing.create', name: 'Create Invoices', description: 'Can generate invoices', category: 'Billing' },
  { id: 'maintenance.view', name: 'View Maintenance', description: 'Can view maintenance tickets', category: 'Maintenance' },
  { id: 'maintenance.manage', name: 'Manage Maintenance', description: 'Can create and assign tickets', category: 'Maintenance' },
  { id: 'reports.view', name: 'View Reports', description: 'Can access reports and analytics', category: 'Reports' },
]

const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: mockPermissions.map(p => p.id),
    userCount: 2,
    isDefault: true,
  },
  {
    id: '2',
    name: 'Property Manager',
    description: 'Can manage properties, tenants, and maintenance',
    permissions: ['properties.view', 'properties.edit', 'tenants.view', 'tenants.create', 'tenants.edit', 'billing.view', 'maintenance.view', 'maintenance.manage', 'reports.view'],
    userCount: 5,
    isDefault: true,
  },
  {
    id: '3',
    name: 'Maintenance Staff',
    description: 'Can view and manage maintenance tickets',
    permissions: ['properties.view', 'maintenance.view', 'maintenance.manage'],
    userCount: 3,
    isDefault: false,
  },
]

export function RolesSettings() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  })

  const permissionsByCategory = mockPermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement create role logic
    console.log('Creating role:', newRole)
    setShowCreateForm(false)
    setNewRole({ name: '', description: '', permissions: [] })
  }

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-4">
          {/* Roles List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Roles</CardTitle>
                  <CardDescription>
                    Manage user roles and their permissions.
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{role.name}</h4>
                          {role.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {role.userCount} user{role.userCount !== 1 ? 's' : ''} • {role.permissions.length} permissions
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedRole(role)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {!role.isDefault && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Create Role Form */}
          {showCreateForm && (
            <Card>
              <CardHeader>
                <CardTitle>Create New Role</CardTitle>
                <CardDescription>
                  Define a new role with specific permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateRole} className="space-y-6">
                  <div>
                    <Label htmlFor="roleName">Role Name</Label>
                    <Input
                      id="roleName"
                      value={newRole.name}
                      onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Leasing Agent"
                      required
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="roleDescription">Description</Label>
                    <Textarea
                      id="roleDescription"
                      value={newRole.description}
                      onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of this role..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label>Permissions</Label>
                    <div className="mt-2 space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                        <div key={category}>
                          <h4 className="font-medium text-sm mb-2">{category}</h4>
                          <div className="space-y-2 pl-4">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  checked={newRole.permissions.includes(permission.id)}
                                  onCheckedChange={() => togglePermission(permission.id)}
                                />
                                <div>
                                  <Label htmlFor={permission.id} className="text-sm font-normal">
                                    {permission.name}
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Role
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Permissions</CardTitle>
              <CardDescription>
                Overview of all available permissions in the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category}>
                    <h3 className="font-semibold text-lg mb-3">{category}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissions.map((permission) => (
                        <div key={permission.id} className="p-3 border rounded-lg">
                          <h4 className="font-medium">{permission.name}</h4>
                          <p className="text-sm text-muted-foreground">{permission.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
