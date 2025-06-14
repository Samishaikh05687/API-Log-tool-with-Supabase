import React, { useState, useEffect } from 'react'
import { Activity, Search, Play, TrendingUp, Code, TestTube, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { LogViewer } from './LogViewer'
import { RequestReplay } from './RequestReplay'
import { PerformanceMonitor } from './PerformanceMonitor'
import { MockGenerator } from './MockGenerator'
import { TestRequests } from './TestRequests'
import { useAPILogs } from '../hooks/useAPILogs'
import { FilterOptions } from '../types/api'

type TabType = 'logs' | 'replay' | 'performance' | 'mocks' | 'test'

const tabs = [
  { id: 'logs' as TabType, name: 'API Logs', icon: Search },
  { id: 'replay' as TabType, name: 'Request Replay', icon: Play },
  { id: 'performance' as TabType, name: 'Performance', icon: TrendingUp },
  { id: 'mocks' as TabType, name: 'Mock Generator', icon: Code },
  { id: 'test' as TabType, name: 'API Tester', icon: TestTube }
]

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('logs')
  const { user, signOut } = useAuth()
  const { logs, allLogs, metrics, filterLogs, clearLogs, exportLogs } = useAPILogs()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-orange-50 to-orange-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">API Logger Pro</h1>
                <p className="text-xs text-orange-600">Professional API Monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  {allLogs.length} requests logged
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-100 rounded-lg">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-orange-800">{user?.email}</span>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0]}!
          </h2>
          <p className="text-gray-600">
            Monitor and debug your APIs with powerful real-time insights.
          </p>
        </div>

        {/* Quick Stats */}
        {metrics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics.totalRequests.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.successRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.averageResponseTime.toFixed(0)}ms</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-orange-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Error Rate</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.errorRate.toFixed(1)}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mb-8 bg-white rounded-xl p-2 border border-orange-100 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.name}
              </button>
            )
          })}
        </nav>

        {/* Tab Content */}
        <main className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden">
          <div className="p-6">
            {activeTab === 'logs' && (
              <LogViewer
                logs={logs}
                onFilter={filterLogs}
                onClearLogs={clearLogs}
                onExport={exportLogs}
              />
            )}
            
            {activeTab === 'replay' && <RequestReplay logs={allLogs} />}
            
            {activeTab === 'performance' && <PerformanceMonitor logs={allLogs} />}
            
            {activeTab === 'mocks' && <MockGenerator logs={allLogs} />}
            
            {activeTab === 'test' && <TestRequests />}
          </div>
        </main>
      </div>
    </div>
  )
}