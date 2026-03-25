"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Clock
} from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  useEffect(() => {
    // Simulate loading projects
    setProjects([
      {
        id: 1,
        name: "Solar Installation - Nairobi Office",
        client: "ABC Company Ltd",
        type: "Solar Installation",
        status: "In Progress",
        startDate: "2024-01-15",
        endDate: "2024-02-15",
        budget: 500000,
        location: "Nairobi, Kenya",
        description: "Complete solar installation for office building"
      },
      {
        id: 2,
        name: "Battery Backup System",
        client: "XYZ Industries",
        type: "Battery System",
        status: "Planning",
        startDate: "2024-02-01",
        endDate: "2024-02-28",
        budget: 300000,
        location: "Mombasa, Kenya",
        description: "Installation of backup battery system"
      },
      {
        id: 3,
        name: "Inverter Upgrade Project",
        client: "DEF Corporation",
        type: "Inverter Installation",
        status: "Completed",
        startDate: "2023-12-01",
        endDate: "2023-12-15",
        budget: 150000,
        location: "Kisumu, Kenya",
        description: "Upgrade existing inverter system"
      }
    ])
    setLoading(false)
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Planning":
        return <Badge variant="secondary">Planning</Badge>
      case "In Progress":
        return <Badge className="bg-blue-600">In Progress</Badge>
      case "Completed":
        return <Badge className="bg-green-600">Completed</Badge>
      case "On Hold":
        return <Badge variant="destructive">On Hold</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleCreateProject = (formData: FormData) => {
    const newProject = {
      id: projects.length + 1,
      name: formData.get("name") as string,
      client: formData.get("client") as string,
      type: formData.get("type") as string,
      status: "Planning",
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      budget: parseInt(formData.get("budget") as string),
      location: formData.get("location") as string,
      description: formData.get("description") as string,
    }
    setProjects([...projects, newProject])
    setIsDialogOpen(false)
  }

  const handleEditProject = (project: any) => {
    setEditingProject(project)
    setIsDialogOpen(true)
  }

  const handleDeleteProject = (id: number) => {
    setProjects(projects.filter(project => project.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-xl font-bold tracking-tight tracking-tight text-gray-900">Project Management</h1>
              <p className="text-gray-600 mt-2">
                Manage your professional projects and installations
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProject ? "Update project details" : "Add a new project to your portfolio"}
                  </DialogDescription>
                </DialogHeader>
                <form action={handleCreateProject} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Project Name *</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        defaultValue={editingProject?.name || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="client">Client Name *</Label>
                      <Input 
                        id="client" 
                        name="client" 
                        required 
                        defaultValue={editingProject?.client || ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Project Type *</Label>
                      <Select name="type" defaultValue={editingProject?.type || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Solar Installation">Solar Installation</SelectItem>
                          <SelectItem value="Battery System">Battery System</SelectItem>
                          <SelectItem value="Inverter Installation">Inverter Installation</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Consultation">Consultation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget (KSH) *</Label>
                      <Input 
                        id="budget" 
                        name="budget" 
                        type="number" 
                        required 
                        defaultValue={editingProject?.budget || ""}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input 
                        id="startDate" 
                        name="startDate" 
                        type="date" 
                        required 
                        defaultValue={editingProject?.startDate || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date *</Label>
                      <Input 
                        id="endDate" 
                        name="endDate" 
                        type="date" 
                        required 
                        defaultValue={editingProject?.endDate || ""}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input 
                      id="location" 
                      name="location" 
                      required 
                      defaultValue={editingProject?.location || ""}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      name="description" 
                      rows={3}
                      defaultValue={editingProject?.description || ""}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsDialogOpen(false)
                        setEditingProject(null)
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingProject ? "Update Project" : "Create Project"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">{projects.length}</div>
              <p className="text-xs text-muted-foreground">All projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">
                {projects.filter(p => p.status === "In Progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">
                {projects.filter(p => p.status === "Completed").length}
              </div>
              <p className="text-xs text-muted-foreground">Finished projects</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold tracking-tight">
                KSH {projects.reduce((total, project) => total + project.budget, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Project value</p>
            </CardContent>
          </Card>
        </div>

        {/* Projects Table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>Manage and track your professional projects</CardDescription>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No projects yet</p>
                <p className="text-sm">Create your first project to get started</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.client}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>KSH {project.budget.toLocaleString()}</TableCell>
                      <TableCell className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        {project.location}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
