import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Users, Store, Gift, TrendingUp, AlertCircle, CheckCircle, Clock, Ban, ShieldAlert, Zap, Megaphone, Trash2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { formatZMW } from '../utils/formatters';
import { useAdminEngine } from '../hooks/useAdminEngine';
import { UserDetailModal } from '../components/admin/UserDetailModal';
import { MerchantDetailModal } from '../components/admin/MerchantDetailModal';
import { GhostOnboardModal } from '../components/admin/GhostOnboardModal';
import { User, Shop } from '../types';
import { toast } from 'sonner';

export function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const { loading, getNodes, getFlows, pruneMockData, forceCancelEscrow } = useAdminEngine();
  
  const [nodes, setNodes] = useState<any[]>([]);
  const [flows, setFlows] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isMerchantModalOpen, setIsMerchantModalOpen] = useState(false);
  const [isGhostModalOpen, setIsGhostModalOpen] = useState(false);

  useEffect(() => {
    refreshData();
  }, [selectedTab]);

  const refreshData = async () => {
    try {
      if (selectedTab === 'overview' || selectedTab === 'nodes') {
        const data = await getNodes();
        setNodes(data);
      }
      if (selectedTab === 'overview' || selectedTab === 'flows') {
        const data = await getFlows();
        setFlows(data);
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  const handlePrune = async () => {
    if (!confirm('CAUTION: This will permanently wipe all mock-prefixed data from the platform. Proceed?')) return;
    try {
      const result = await pruneMockData();
      toast.success('Maintenance Complete', { 
        description: `Purged: ${result.stats.shops} Shops, ${result.stats.products} Products, ${result.stats.transactions} Flows.` 
      });
      refreshData();
    } catch (err) {}
  };

  // KGCC Logic: Real-time Stats Aggregator
  const stats = {
    totalUsers: nodes.reduce((acc, n) => acc + (n.user_count || 1), 0), // Base logic
    totalNodes: nodes.length,
    activeFlows: flows.filter(f => f.status === 'in_escrow').length,
    totalVolume: flows.reduce((acc, f) => acc + Number(f.amount), 0),
    securityAlerts: 3, // Mocked for now until platform_alerts hook
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <div className="container mx-auto px-4 md:px-6 py-12">
        {/* KGCC Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-black mb-2 italic">KGCC <span className="text-muted-foreground not-italic">/ Command & Control</span></h1>
            <p className="text-sm font-light text-muted-foreground">Lead Systems Architect Console (Bypassing RLS)</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handlePrune}
              className="rounded-full border-red-100 text-red-600 hover:bg-red-50 font-light"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Prune Mock Data
            </Button>
            <Button 
              onClick={refreshData}
              className="rounded-full bg-black text-white hover:bg-zinc-800 font-light px-8"
              disabled={loading}
            >
              Sync Platform
            </Button>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="bg-white/50 backdrop-blur-sm border border-zinc-100 p-1 rounded-full inline-flex">
            <TabsTrigger value="overview" className="rounded-full px-6 transition-all data-[state=active]:bg-black data-[state=active]:text-white font-light">Nodes & Flows</TabsTrigger>
            <TabsTrigger value="nodes" className="rounded-full px-6 transition-all data-[state=active]:bg-black data-[state=active]:text-white font-light">Shop Registry</TabsTrigger>
            <TabsTrigger value="flows" className="rounded-full px-6 transition-all data-[state=active]:bg-black data-[state=active]:text-white font-light">Transaction Ledger</TabsTrigger>
            <TabsTrigger value="ads" className="rounded-full px-6 transition-all data-[state=active]:bg-black data-[state=active]:text-white font-light">Ad Engine</TabsTrigger>
            <TabsTrigger value="security" className="rounded-full px-6 transition-all data-[state=active]:bg-black data-[state=active]:text-white font-light">Security Alerts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Platform Nodes" value={stats.totalNodes} icon={Store} subtitle="Total registered shops" />
              <StatCard title="Active Flows" value={stats.activeFlows} icon={Zap} subtitle="Transactions in escrow" color="text-orange-500" />
              <StatCard title="Total Volume" value={formatZMW(stats.totalVolume)} icon={TrendingUp} subtitle="Total platform throughput" />
              <StatCard title="System Alerts" value={stats.securityAlerts} icon={ShieldAlert} subtitle="Unresolved security events" alert />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="rounded-[2rem] border-zinc-100 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl font-light">Recent Flows</CardTitle>
                      <CardDescription className="font-light">Real-time platform throughput</CardDescription>
                    </div>
                    <Badge variant="outline" className="font-light rounded-full px-4">Live Ledger</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-zinc-50/30">
                      <TableRow>
                        <TableHead className="font-light px-8">Transaction</TableHead>
                        <TableHead className="font-light">Amount</TableHead>
                        <TableHead className="font-light px-8">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flows.slice(0, 5).map((flow) => (
                        <TableRow key={flow.id} className="hover:bg-zinc-50/50 transition-colors">
                          <TableCell className="px-8 py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{flow.claim_code}</span>
                              <span className="text-xs text-muted-foreground font-light">{flow.shop?.business_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{formatZMW(flow.amount)}</TableCell>
                          <TableCell className="px-8">
                            <Badge className={`font-light rounded-full px-3 ${
                              flow.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' : 
                              flow.status === 'in_escrow' ? 'bg-orange-50 text-orange-700 border-orange-100' : 'bg-zinc-50 text-zinc-600'
                            }`}>
                              {flow.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-zinc-100 shadow-sm">
                <CardHeader className="px-8 py-6">
                  <CardTitle className="text-xl font-light">Node Health</CardTitle>
                  <CardDescription className="font-light">Shop status and performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="px-8">
                  <div className="space-y-6">
                    {nodes.slice(0, 4).map((node) => (
                      <div key={node.id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                            <Store className="w-5 h-5" strokeWidth={1.5} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{node.business_name}</p>
                            <p className="text-xs text-muted-foreground font-light">{node.product_count} Products mapped</p>
                          </div>
                        </div>
                        <Badge className="font-light rounded-full bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                          {node.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Nodes Tab (Formerly Merchants) */}
          <TabsContent value="nodes" className="space-y-4">
            <Card className="rounded-[2rem] border-zinc-100 shadow-sm">
              <CardHeader className="px-8 py-6">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-xl font-light">Shop Registry</CardTitle>
                    <CardDescription className="font-light">Manage platform nodes and ghost onboarding</CardDescription>
                  </div>
                  <Button 
                    onClick={() => setIsGhostModalOpen(true)}
                    className="rounded-full bg-orange-500 text-white hover:bg-orange-600 font-light px-6"
                  >
                    <Megaphone className="w-4 h-4 mr-2" />
                    Ghost Onboard
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-zinc-50/30">
                    <TableRow>
                      <TableHead className="font-light px-8">Business Name</TableHead>
                      <TableHead className="font-light">District</TableHead>
                      <TableHead className="font-light">Owner</TableHead>
                      <TableHead className="font-light text-center">Ghost</TableHead>
                      <TableHead className="font-light">Status</TableHead>
                      <TableHead className="font-light px-8 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nodes.map((node) => (
                      <TableRow key={node.id} className="hover:bg-zinc-50/50 transition-colors">
                        <TableCell className="px-8 py-4 font-medium">{node.business_name}</TableCell>
                        <TableCell className="font-light">{node.district?.name || 'Lusaka'}</TableCell>
                        <TableCell className="font-light italic text-muted-foreground">{node.owner?.email || 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          {node.is_ghost ? <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-100">Ghost</Badge> : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`font-light rounded-full px-3 ${
                            node.status === 'active' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-zinc-50 text-zinc-600'
                          }`}>
                            {node.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          <Button 
                            variant="ghost" 
                            className="text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full"
                          >
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flows Tab (Formerly Transactions) */}
          <TabsContent value="flows" className="space-y-4">
            <Card className="rounded-[2rem] border-zinc-100 shadow-sm">
              <CardHeader className="px-8 py-6">
                <CardTitle className="text-xl font-light">Global Ledger</CardTitle>
                <CardDescription className="font-light">End-to-end platform throughput and auditing</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-zinc-50/30">
                    <TableRow>
                      <TableHead className="font-light px-8">Handshake Code</TableHead>
                      <TableHead className="font-light">Buyer</TableHead>
                      <TableHead className="font-light">Merchant</TableHead>
                      <TableHead className="font-light">Amount</TableHead>
                      <TableHead className="font-light">Status</TableHead>
                      <TableHead className="font-light px-8 text-right">Emergency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {flows.map((flow) => (
                      <TableRow key={flow.id} className="hover:bg-zinc-50/50 transition-colors">
                        <TableCell className="px-8 py-4 font-mono text-sm tracking-wider">{flow.claim_code}</TableCell>
                        <TableCell className="font-light">{flow.buyer?.full_name || 'N/A'}</TableCell>
                        <TableCell className="font-light">{flow.shop?.business_name}</TableCell>
                        <TableCell className="font-medium">{formatZMW(flow.amount)}</TableCell>
                        <TableCell>
                          <Badge className={`font-light rounded-full px-3 ${
                            flow.status === 'completed' ? 'bg-green-50 text-green-700' : 
                            flow.status === 'in_escrow' ? 'bg-orange-50 text-orange-700 font-medium' : 'bg-zinc-50'
                          }`}>
                            {flow.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 text-right">
                          {flow.status === 'in_escrow' && (
                            <Button 
                              variant="ghost" 
                              onClick={() => forceCancelEscrow(flow.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full h-8"
                            >
                              Force Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ad Engine Tab */}
          <TabsContent value="ads" className="space-y-4">
             <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-12 bg-zinc-50/50 rounded-[3rem] border border-dashed border-zinc-200">
               <Megaphone className="w-12 h-12 text-zinc-300 mb-6" />
               <h3 className="text-xl font-light mb-2">Ad Engine Logic Loaded</h3>
               <p className="text-sm text-muted-foreground font-light max-w-sm">The background infrastructure for ads is online. Create ribbons or global alerts using the master API.</p>
               <Button className="mt-8 rounded-full bg-black text-white px-8">Add New Campaign</Button>
             </div>
          </TabsContent>

          {/* Security Alerts Tab */}
          <TabsContent value="security" className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AlertCard severity="low" title="System Maintenance" message="Platform maintenance window scheduled for midnight." />
                <AlertCard severity="high" title="Unusual Handshake Volume" message="A shop in Lusaka is processing 10x normal volume." />
             </div>
          </TabsContent>
        </Tabs>
      </div>

      <UserDetailModal 
        isOpen={isUserModalOpen} 
        onClose={() => setIsUserModalOpen(false)} 
        user={selectedUser} 
        profile={null} 
      />
      
      <MerchantDetailModal 
        isOpen={isMerchantModalOpen} 
        onClose={() => setIsMerchantModalOpen(false)} 
        shop={selectedShop} 
      />

      <GhostOnboardModal
        isOpen={isGhostModalOpen}
        onClose={() => setIsGhostModalOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}

function AlertCard({ severity, title, message }: any) {
  return (
    <Card className={`rounded-[2rem] border-zinc-100 ${severity === 'high' ? 'bg-red-50/30 border-red-50' : ''}`}>
      <CardContent className="p-8">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${severity === 'high' ? 'bg-red-100 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
          <ShieldAlert className="w-5 h-5" />
        </div>
        <h4 className="text-lg font-medium mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground font-light">{message}</p>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, icon: Icon, subtitle, color = "text-black", alert }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`rounded-[2.5rem] border-zinc-100 shadow-sm ${alert ? 'bg-red-50/50 border-red-100' : 'bg-white'}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl ${alert ? 'bg-red-100 text-red-600' : 'bg-zinc-50 text-zinc-400'} flex items-center justify-center`}>
              <Icon className="w-7 h-7" strokeWidth={1.5} />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-sm text-muted-foreground font-light">{title}</h3>
            <p className={`text-3xl font-medium tracking-tight ${color}`}>{value}</p>
            {subtitle && <p className="text-[10px] text-muted-foreground font-light uppercase tracking-widest pt-2">{subtitle}</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
