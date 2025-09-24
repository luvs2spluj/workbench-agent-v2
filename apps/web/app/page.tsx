'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label } from '@langchain-flow/ui'
import { Project } from '@langchain-flow/utils'
import { createProject, getProjects, createRun } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Plus, Play, Github, Settings, Activity } from 'lucide-react'

export default function HomePage() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [newProjectRepo, setNewProjectRepo] = useState('')

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
    enabled: isAuthenticated,
  })

  const createProjectMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsCreateDialogOpen(false)
      setNewProjectName('')
      setNewProjectDescription('')
      setNewProjectRepo('')
    },
  })

  const createRunMutation = useMutation({
    mutationFn: createRun,
    onSuccess: (data) => {
      // Redirect to run page
      window.location.href = `/runs/${data.id}`
    },
  })

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return
    
    createProjectMutation.mutate({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      githubRepo: newProjectRepo.trim() || undefined,
    })
  }

  const handleRunProject = (project: Project) => {
    createRunMutation.mutate({
      projectId: project.id,
      name: `Run ${project.name} - ${new Date().toLocaleString()}`,
      triggerType: 'manual',
      config: {},
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">LangChain Flow</CardTitle>
            <CardDescription>
              Full-stack dev tool to manage repos, visualize flows, and automate workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => window.location.href = '/auth/login'}
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">LangChain Flow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Projects</h2>
              <p className="text-gray-600 mt-2">
                Manage your repositories, run workflows, and visualize data flows
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Set up a new project to start automating your workflows
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="col-span-3"
                      placeholder="My Awesome Project"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      Description
                    </Label>
                    <Input
                      id="description"
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      className="col-span-3"
                      placeholder="Optional description..."
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="repo" className="text-right">
                      GitHub Repo
                    </Label>
                    <Input
                      id="repo"
                      value={newProjectRepo}
                      onChange={(e) => setNewProjectRepo(e.target.value)}
                      className="col-span-3"
                      placeholder="username/repository"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectName.trim() || createProjectMutation.isLoading}
                  >
                    {createProjectMutation.isLoading ? 'Creating...' : 'Create Project'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{project.name}</span>
                      {project.githubRepo && (
                        <Github className="h-4 w-4 text-gray-500" />
                      )}
                    </CardTitle>
                    <CardDescription>
                      {project.description || 'No description provided'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRunProject(project)}
                        disabled={createRunMutation.isLoading}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                    </div>
                    {project.githubRepo && (
                      <div className="mt-2 text-xs text-blue-600">
                        {project.githubRepo}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  className="h-full w-full"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-4">
                Create your first project to start automating your workflows
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
