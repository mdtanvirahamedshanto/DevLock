'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { configService } from '@/services/config.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormSkeleton } from '@/components/shared/loading-skeleton';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Wrench, Bell } from 'lucide-react';
import { useState } from 'react';
import { formatRelative } from '@/lib/utils';

export default function ConfigPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const queryClient = useQueryClient();
  const [killSwitchDialog, setKillSwitchDialog] = useState(false);
  const [killSwitchReason, setKillSwitchReason] = useState('');
  const [notifDialog, setNotifDialog] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('payment');

  const { data: config, isLoading } = useQuery({
    queryKey: ['config', projectId],
    queryFn: () => configService.getConfig(projectId),
    enabled: !!projectId,
  });

  const updateConfigMutation = useMutation({
    mutationFn: (data: any) => configService.updateConfig(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', projectId] });
      setNotifDialog(false);
      setNotifMessage('');
    },
  });

  const maintenanceMutation = useMutation({
    mutationFn: (enabled: boolean) => configService.toggleMaintenance(projectId, enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config', projectId] }),
  });

  const killSwitchActivateMutation = useMutation({
    mutationFn: (reason: string) => configService.activateKillSwitch(projectId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config', projectId] });
      setKillSwitchDialog(false);
      setKillSwitchReason('');
    },
  });

  const killSwitchDeactivateMutation = useMutation({
    mutationFn: () => configService.deactivateKillSwitch(projectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['config', projectId] }),
  });

  if (isLoading) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Maintenance Mode</CardTitle>
          </div>
          <CardDescription>
            When enabled, all SDK validations will return a maintenance response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {config?.maintenance ? 'Enabled' : 'Disabled'}
              </span>
              {config?.maintenance && <Badge variant="warning">Active</Badge>}
            </div>
            <Switch
              checked={config?.maintenance ?? false}
              onCheckedChange={(checked) => maintenanceMutation.mutate(checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Kill Switch */}
      <Card className={config?.killSwitch ? 'border-destructive' : ''}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-base">Kill Switch</CardTitle>
          </div>
          <CardDescription>
            Emergency shutdown — immediately disables all license validations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              {config?.killSwitch ? (
                <div className="space-y-1">
                  <Badge variant="destructive">ACTIVATED</Badge>
                  {config.killSwitchReason && (
                    <p className="text-sm text-muted-foreground">
                      Reason: {config.killSwitchReason}
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Not activated</span>
              )}
            </div>
            {config?.killSwitch ? (
              <Button
                variant="outline"
                onClick={() => killSwitchDeactivateMutation.mutate()}
                loading={killSwitchDeactivateMutation.isPending}
              >
                Deactivate
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => setKillSwitchDialog(true)}
              >
                Activate Kill Switch
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Client Notifications</CardTitle>
          </div>
          <CardDescription>
            Messages displayed to SDK clients on validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium">Active Notifications</h3>
            <Button variant="outline" size="sm" onClick={() => setNotifDialog(true)}>
              Add Notification
            </Button>
          </div>
          {config?.notifications?.length ? (
            <div className="space-y-3">
              {config.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between rounded-md border border-border p-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{notification.title || notification.type}</p>
                      <Badge
                        variant={
                          notification.type === 'critical' || notification.type === 'error'
                            ? 'destructive'
                            : notification.type === 'payment' || notification.type === 'warning'
                            ? 'warning'
                            : 'secondary'
                        }
                      >
                        {notification.type}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelative(notification.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => {
                      updateConfigMutation.mutate({
                        notifications: config.notifications.filter(n => n.id !== notification.id)
                      });
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No notifications configured</p>
          )}
        </CardContent>
      </Card>

      {/* Kill Switch Confirmation */}
      <Dialog open={killSwitchDialog} onOpenChange={setKillSwitchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Activate Kill Switch</DialogTitle>
            <DialogDescription>
              This will immediately disable ALL license validations for this project. All SDK clients will receive a kill-switch response. Are you sure?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Lock Message / Reason</Label>
              <Input
                id="reason"
                placeholder="e.g. Payment Due"
                value={killSwitchReason}
                onChange={(e) => setKillSwitchReason(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent to the SDK clients and displayed to the end-users.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setKillSwitchDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => killSwitchActivateMutation.mutate(killSwitchReason || 'Emergency shutdown')}
                disabled={killSwitchActivateMutation.isPending}
              >
                {killSwitchActivateMutation.isPending ? 'Activating...' : 'Activate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Notification Dialog */}
      <Dialog open={notifDialog} onOpenChange={setNotifDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Notification</DialogTitle>
            <DialogDescription>
              Create a message that will be shown in the client application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
              >
                <option value="payment">Payment Warning</option>
                <option value="warning">General Warning</option>
                <option value="error">Error</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Input
                placeholder="e.g. Payment is due next week."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setNotifDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  const newNotif = {
                    id: Math.random().toString(36).substring(7),
                    title: notifType === 'payment' ? 'Payment Due' : notifType.toUpperCase(),
                    type: notifType,
                    severity: notifType === 'payment' ? 'high' : 'medium',
                    message: notifMessage,
                    active: true,
                    dismissible: true,
                  };
                  updateConfigMutation.mutate({
                    notifications: [...(config?.notifications || []), newNotif],
                  });
                }}
                disabled={!notifMessage || updateConfigMutation.isPending}
              >
                {updateConfigMutation.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
