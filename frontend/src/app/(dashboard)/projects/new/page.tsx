'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { FolderKanban, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { projectService } from '@/services/project.service';

export default function NewProjectPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const createMutation = useMutation({
    mutationFn: () => projectService.create({ name, description }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      const projectId = (data as any)?.id || (data as any)?._id;
      if (projectId) {
        router.push(`/projects/${projectId}`);
      } else {
        router.push('/projects');
      }
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create project');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setError('');
    createMutation.mutate();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/projects">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
        </Link>
        <PageHeader 
          title="Create New Project" 
          description="Initialize a new workspace for your application licenses" 
        />
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <Label htmlFor="name" className="text-sm font-semibold">Project Name <span className="text-red-500">*</span></Label>
              <div className="relative">
                <FolderKanban className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="e.g. My Awesome App"
                  className="pl-10 h-11"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={createMutation.isPending}
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-sm font-semibold">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="A brief description of what this project is about..."
                className="resize-none min-h-[120px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={createMutation.isPending}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Link href="/projects">
                <Button variant="outline" type="button" disabled={createMutation.isPending}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={createMutation.isPending} className="bg-primary min-w-[120px]">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Project'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
