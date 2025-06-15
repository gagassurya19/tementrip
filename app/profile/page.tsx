"use client"

import type React from "react"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/contexts/user-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

export default function Profile() {
  const { user, isAuthenticated, updateProfile, isLoading } = useUser()
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [tripType, setTripType] = useState("")
  const [budget, setBudget] = useState("")
  const [interests, setInterests] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }

    if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
      setTripType(user.preferences.tripType)
      setBudget(user.preferences.budget)
      setInterests(user.preferences.interests)
    }
  }, [isLoading, isAuthenticated, router, user])

  if (!isAuthenticated || !user) {
    return null
  }

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      await updateProfile({
        name,
        email,
        phone,
      })
      toast.success("Personal information updated successfully")
    } catch (error) {
      console.error("Failed to update personal information:", error)
      toast.error("Failed to update personal information")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!tripType) {
      toast.error("Please select a trip type")
      return
    }
    
    if (interests.length === 0) {
      toast.error("Please select at least one interest")
      return
    }
    
    if (!budget) {
      toast.error("Please select a budget range")
      return
    }
    
    setIsSaving(true)

    try {
      await updateProfile({
        preferences: {
          tripType,
          interests,
          budget,
        },
      })
      toast.success("Travel preferences updated successfully")
    } catch (error) {
      console.error("Failed to update travel preferences:", error)
      toast.error("Failed to update travel preferences")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleInterest = (interest: string) => {
    setInterests((prev) => (prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]))
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container py-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/images/avatar.png" alt={user.name} />
            <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-8">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="preferences">Travel Preferences</TabsTrigger>
            {/* <TabsTrigger value="security">Security</TabsTrigger> */}
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6 max-w-md" onSubmit={handlePersonalInfoSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>

                  {/* <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62 123 456 7890"
                    />
                  </div> */}

                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Travel Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6 max-w-md" onSubmit={handlePreferencesSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="trip-type">
                      Preferred Trip Type <span className="text-red-500">*</span>
                    </Label>
                    <Select value={tripType} onValueChange={setTripType} disabled={isSaving}>
                      <SelectTrigger id="trip-type">
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solo">Solo Trip</SelectItem>
                        <SelectItem value="couple">Couple</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Interests <span className="text-red-500">*</span>
                      {interests.length > 0 && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({interests.length} selected)
                        </span>
                      )}
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      {["nature", "culture", "food", "adventure", "relaxation", "history", "shopping", "nightlife"].map(
                        (interest) => (
                          <div key={interest} className="flex items-center space-x-2">
                            <Checkbox
                              id={`interest-${interest}`}
                              checked={interests.includes(interest)}
                              onCheckedChange={() => toggleInterest(interest)}
                              disabled={isSaving}
                            />
                            <label
                              htmlFor={`interest-${interest}`}
                              className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                isSaving ? "opacity-50" : ""
                              }`}
                            >
                              {interest.charAt(0).toUpperCase() + interest.slice(1)}
                            </label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">
                      Budget Range <span className="text-red-500">*</span>
                    </Label>
                    <Select value={budget} onValueChange={setBudget} disabled={isSaving}>
                      <SelectTrigger id="budget">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget (&lt; $50/day)</SelectItem>
                        <SelectItem value="medium">Medium ($50-150/day)</SelectItem>
                        <SelectItem value="luxury">Luxury (&gt; $150/day)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Preferences...
                      </>
                    ) : (
                      "Save Preferences"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                  </div>

                  <Button>Update Password</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
