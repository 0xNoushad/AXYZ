"use client";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="mt-6 space-y-6">
            <div className="space-y-4 rounded-lg border p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback>AXYZ</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Profile Picture</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Upload</Button>
                    <Button variant="outline" size="sm">Remove</Button>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input id="display-name" placeholder="Your display name" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio" 
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Tell others about yourself"
                  />
                </div>
              </div>
              
              <Button>Save Changes</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="account" className="mt-6 space-y-6">
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="text-lg font-medium">Account Information</h3>
              
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email address" />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value="••••••••" />
                </div>
              </div>
              
              <Button>Update Account</Button>
            </div>
            
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="text-lg font-medium">Connected Wallets</h3>
              <div className="rounded border p-4">
                <p className="text-sm text-muted-foreground">No wallets connected</p>
              </div>
              <Button variant="outline">Connect Wallet</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="mt-6">
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="text-lg font-medium">Theme</h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle between light and dark mode</p>
                </div>
                <Switch />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <div className="space-y-4 rounded-lg border p-6">
              <h3 className="text-lg font-medium">Notification Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Trade Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about important trading events</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Features</p>
                    <p className="text-sm text-muted-foreground">Be the first to know about new features</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}