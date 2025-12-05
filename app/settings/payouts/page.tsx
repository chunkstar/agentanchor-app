'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { CreditCard, DollarSign, CheckCircle, AlertCircle, ExternalLink, Clock, ArrowRight, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface PayoutAccount {
  id: string
  stripeAccountId: string | null
  stripeAccountStatus: string
  stripeOnboardingComplete: boolean
  payoutSchedule: string
  payoutThreshold: number
  subscriptionTier: 'free' | 'pro' | 'enterprise'
}

interface Payout {
  id: string
  amount: number
  netAmount: number
  platformFee: number
  status: string
  requestedAt: string
  completedAt?: string
}

const platformFees = {
  free: '15%',
  pro: '10%',
  enterprise: '7%',
}

export default function PayoutsPage() {
  const searchParams = useSearchParams()
  const [account, setAccount] = useState<PayoutAccount | null>(null)
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [pendingEarnings, setPendingEarnings] = useState(0)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [threshold, setThreshold] = useState('100')
  const [schedule, setSchedule] = useState('weekly')

  // Check for success/refresh from Stripe onboarding
  const success = searchParams.get('success')
  const refresh = searchParams.get('refresh')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (success === 'true') {
      // Refresh account status after successful onboarding
      loadData()
    }
  }, [success])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load account
      const accountRes = await fetch('/api/payments/account')
      if (accountRes.ok) {
        const data = await accountRes.json()
        setAccount(data.account)
        setPendingEarnings(data.pendingEarnings || 0)
      }

      // Load payout history
      const payoutsRes = await fetch('/api/payments/payouts')
      if (payoutsRes.ok) {
        const data = await payoutsRes.json()
        setPayouts(data.payouts || [])
      }
    } catch (error) {
      console.error('Failed to load payout data:', error)
    }
    setLoading(false)
  }

  const handleConnectStripe = async () => {
    setConnecting(true)
    try {
      const res = await fetch('/api/payments/connect', {
        method: 'POST',
      })
      if (res.ok) {
        const data = await res.json()
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl
      }
    } catch (error) {
      console.error('Failed to connect Stripe:', error)
    }
    setConnecting(false)
  }

  const handleRequestPayout = async () => {
    setRequestingPayout(true)
    try {
      const res = await fetch('/api/payments/payout', {
        method: 'POST',
      })
      if (res.ok) {
        loadData()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to request payout')
      }
    } catch (error) {
      console.error('Failed to request payout:', error)
    }
    setRequestingPayout(false)
  }

  const handleUpdateSettings = async () => {
    try {
      await fetch('/api/payments/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payoutThreshold: parseFloat(threshold),
          payoutSchedule: schedule,
        }),
      })
      loadData()
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Wallet className="h-8 w-8 text-[#1E40AF]" />
          Payout Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your earnings and payout preferences
        </p>
      </div>

      {/* Success Banner */}
      {success === 'true' && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800 dark:text-green-200">
            Stripe account connected successfully! You can now receive payouts.
          </p>
        </div>
      )}

      {/* Earnings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${pendingEarnings.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Platform Fee</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {platformFees[account?.subscriptionTier || 'free']}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {account?.subscriptionTier === 'free' && 'Upgrade to Pro for 10%'}
              {account?.subscriptionTier === 'pro' && 'Upgrade to Enterprise for 7%'}
              {account?.subscriptionTier === 'enterprise' && 'Best rate available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Payout Threshold</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${account?.payoutThreshold || 100}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stripe Connection */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Method
          </CardTitle>
          <CardDescription>
            Connect your Stripe account to receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!account?.stripeAccountId ? (
            <div className="text-center py-6">
              <div className="mb-4">
                <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 inline-block">
                  <CreditCard className="h-8 w-8 text-gray-400" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No payment method connected
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Connect your Stripe account to receive earnings from agent usage. Stripe handles all payment processing securely.
              </p>
              <Button
                onClick={handleConnectStripe}
                disabled={connecting}
                className="bg-[#635BFF] hover:bg-[#5851DB]"
              >
                {connecting ? 'Connecting...' : 'Connect with Stripe'}
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-[#635BFF]/10">
                  <CreditCard className="h-6 w-6 text-[#635BFF]" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    Stripe Account Connected
                  </p>
                  <p className="text-sm text-gray-500">
                    Account ID: {account.stripeAccountId.slice(0, 12)}...
                  </p>
                </div>
              </div>
              <Badge className={
                account.stripeOnboardingComplete
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }>
                {account.stripeOnboardingComplete ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Setup Required
                  </>
                )}
              </Badge>
            </div>
          )}

          {account?.stripeAccountId && !account.stripeOnboardingComplete && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Complete your Stripe account setup to start receiving payouts.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleConnectStripe}
              >
                Complete Setup
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Settings */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payout Preferences</CardTitle>
          <CardDescription>
            Configure when and how you receive payouts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Minimum Payout Threshold
              </label>
              <div className="flex gap-2 mt-1">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="pl-7"
                    min="10"
                    step="10"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Payouts will be held until this amount is reached
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Payout Schedule
              </label>
              <Select value={schedule} onValueChange={setSchedule}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="biweekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="threshold">When threshold reached</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={handleUpdateSettings}>
              Save Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Payout */}
      {account?.stripeOnboardingComplete && pendingEarnings >= (account?.payoutThreshold || 100) && (
        <Card className="mb-8 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Ready for Payout
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have ${pendingEarnings.toFixed(2)} available for withdrawal
                </p>
              </div>
              <Button
                onClick={handleRequestPayout}
                disabled={requestingPayout}
                className="bg-green-600 hover:bg-green-700"
              >
                {requestingPayout ? 'Processing...' : 'Request Payout'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Your recent payouts and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payouts yet</p>
              <p className="text-sm">Start earning by publishing agents to the marketplace</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-medium text-gray-900 dark:text-white">
                        ${payout.netAmount.toFixed(2)}
                      </p>
                      <Badge className={
                        payout.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : payout.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : payout.status === 'processing'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }>
                        {payout.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      Requested {new Date(payout.requestedAt).toLocaleDateString()}
                      {payout.completedAt && ` • Completed ${new Date(payout.completedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Gross: ${payout.amount.toFixed(2)}</p>
                    <p>Fee: ${payout.platformFee.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
