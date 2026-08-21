'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Lock,
  Loader2,
  Save,
  CheckCircle,
  Globe,
  Keyboard,
  Timer,
  Volume2,
  Tv,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/use-auth';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  preferences: {
    preferredLanguage: string;
    preferredKeyboard: string;
    dailyGoal: number;
    soundEnabled: boolean;
    keyboardVisible: boolean;
    theme: string;
    showFingerGuide: boolean;
    fontSize: string;
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4 },
  }),
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  
  // Profile form state
  const [name, setName] = useState('');
  const [preferences, setPreferences] = useState<ProfileData['preferences']>({
    preferredLanguage: 'english',
    preferredKeyboard: 'qwerty',
    dailyGoal: 15,
    soundEnabled: true,
    keyboardVisible: true,
    theme: 'system',
    showFingerGuide: true,
    fontSize: 'medium',
  });

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        const json = await res.json();
        if (json.success) {
          setName(json.data.name);
          if (json.data.preferences) {
            setPreferences(json.data.preferences);
          }
        }
      } catch {
        console.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--primary))]" />
      </div>
    );
  }

  // Handle profile / preferences save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, preferences }),
      });
      const json = await res.json();
      if (json.success) {
        setProfileSuccess(true);
        refreshUser();
      }
    } catch {
      console.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const json = await res.json();
      if (json.success) {
        setPasswordSuccess('Password updated successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(json.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('An unexpected error occurred');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <Settings className="h-8 w-8 text-[hsl(var(--primary))]" />
          Profile Settings
        </h1>
        <p className="mt-1 text-[hsl(var(--muted-foreground))]">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Side: General Profile Info */}
        <div className="space-y-6 md:col-span-2">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-4 w-4 text-[hsl(var(--primary))]" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
                      <CheckCircle className="h-4 w-4" />
                      Profile and preferences updated successfully
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" value={user?.email || ''} disabled className="bg-[hsl(var(--muted))]" />
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">Email cannot be changed</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <h3 className="pt-4 font-semibold text-sm">Preferences</h3>
                  
                  {/* Toggle preferences */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          Sound Effects
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Play click sounds while typing</p>
                      </div>
                      <Switch
                        checked={preferences.soundEnabled}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, soundEnabled: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <Tv className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          On-Screen Keyboard
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Display key layout while practicing</p>
                      </div>
                      <Switch
                        checked={preferences.keyboardVisible}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, keyboardVisible: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                          Finger Guides
                        </Label>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">Show colored guides for finger positions</p>
                      </div>
                      <Switch
                        checked={preferences.showFingerGuide}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showFingerGuide: checked }))}
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button type="submit" disabled={savingProfile} className="gap-2">
                      {savingProfile ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right Side: Password Change */}
        <div className="space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4 text-[hsl(var(--destructive))]" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSavePassword} className="space-y-4">
                  {passwordError && (
                    <div className="rounded-lg bg-[hsl(var(--destructive)/0.1)] p-3 text-sm text-[hsl(var(--destructive))]">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="rounded-lg bg-[hsl(var(--success)/0.1)] p-3 text-sm text-[hsl(var(--success))]">
                      {passwordSuccess}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" disabled={savingPassword} className="w-full gap-2">
                      {savingPassword ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
