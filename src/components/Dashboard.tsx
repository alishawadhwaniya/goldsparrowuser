import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  CheckCheck,
  Clock,
  Filter,
  Package,
  Search,
  Truck,
  CalendarIcon,
  ChevronDown
} from "lucide-react";
import React, { useState, useCallback, useEffect } from 'react';
import PacketForm from './PacketForm';
import PacketList from './PacketList';
import { gradients, textColors, GradientColor } from "@/theme/colors";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from '@/api/client';
import { useUser } from '@/hooks/useUser';
import { useDeviceSize } from '@/hooks/use-responsive';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: GradientColor;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const getColorClass = () => {
    switch (color) {
      case "navy":
        return `${gradients.navy.default} ${textColors.white}`;
      case "gold":
        return gradients.gold.default;
      case "green":
        return `${gradients.green.default} ${textColors.white}`;
      case "yellow":
        return gradients.yellow.default;
      default:
        return "from-gray-100 to-gray-200";
    }
  };

  return (
    <Card className="card-hover overflow-hidden">
      <div className={`bg-gradient-to-br ${getColorClass()} p-1 xxs:p-1.5 sm:p-2`}>
        <CardHeader className="pb-1 xxs:pb-1.5 sm:pb-2 pt-2 xxs:pt-2.5 sm:pt-3 px-2 xxs:px-3 sm:px-4">
          <CardTitle className="text-xs xxs:text-sm font-medium opacity-80">{title}</CardTitle>
        </CardHeader>
        <CardContent className="px-2 xxs:px-3 sm:px-4 pb-2 xxs:pb-2.5 sm:pb-3">
          <div className="flex justify-between items-center">
            <p className="text-lg xxs:text-xl sm:text-2xl md:text-3xl font-bold">{value}</p>
            <div className="h-6 w-6 xxs:h-7 xxs:w-7 sm:h-8 sm:w-8">
              {icon}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

interface PacketStats {
  totalPackets: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  lifted: number;
  onHold: number;
}

const Dashboard = () => {
  const { user } = useUser();
  const { isSmallPhone, isPhone, isTablet } = useDeviceSize();
  const isMobile = isSmallPhone || isPhone;

  const [activeTab, setActiveTab] = useState("packets");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stats, setStats] = useState<PacketStats>({
    totalPackets: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    lifted: 0,
    onHold: 0
  });
  const { toast } = useToast();

  const fetchStats = useCallback(async () => {
    try {
      const response = await apiClient.get<PacketStats>(`/packets/stats`);

      if (response.success) {
        setStats({
          approved: response.data.approved,
          pendingApproval: response.data.pendingApproval,
          rejected: response.data.rejected,
          lifted: response.data.lifted,
          onHold: response.data.onHold,
          totalPackets: response.data.totalPackets
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch statistics. Please try again.",
        variant: "destructive",
      });
    }
  }, [dateFrom, dateTo, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const clearDateFilter = () => {
    setDateFrom(undefined);
    setDateTo(undefined);
    setIsDateFilterOpen(false);
    fetchStats();
  };

  const applyDateFilter = () => {
    setIsDateFilterOpen(false);
    fetchStats();
  };

  return (
    <div className="container px-2 xxs:px-3 xs:px-4 py-4 xxs:py-5 xs:py-6 sm:py-8 space-y-4 xxs:space-y-5 xs:space-y-6 sm:space-y-8 max-w-7xl mb-16 xs:mb-20 sm:mb-28">
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 xxs:gap-3 sm:gap-4">
        <StatCard
          title="Total Packets"
          value={stats.totalPackets}
          icon={<Package className="h-full w-full" />}
          color="navy"
        />
        <StatCard
          title="Pending Approval"
          value={stats.pendingApproval}
          icon={<Clock className="h-full w-full" />}
          color="yellow"
        />
        <StatCard
          title="Approved"
          value={stats.approved}
          icon={<CheckCheck className="h-full w-full" />}
          color="green"
        />
        <StatCard
          title="Lifted Packets"
          value={stats.lifted}
          icon={<Truck className="h-full w-full" />}
          color="gold"
        />
      </div>

      <Tabs
        defaultValue="packets"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 xs:gap-4 mb-3 xs:mb-4">
          <TabsList className="h-9 xxs:h-10 sm:h-12 w-full xs:w-auto">
            <TabsTrigger
              value="packets"
              className="text-xs xxs:text-sm px-2 xxs:px-3 xs:px-4 sm:px-6 py-1.5 xxs:py-2 sm:py-2.5"
            >
              All Packets
            </TabsTrigger>
            <TabsTrigger
              value="submit"
              className="text-xs xxs:text-sm px-2 xxs:px-3 xs:px-4 sm:px-6 py-1.5 xxs:py-2 sm:py-2.5"
            >
              Submit New
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-xs xxs:text-sm px-2 xxs:px-3 xs:px-4 sm:px-6 py-1.5 xxs:py-2 sm:py-2.5"
            >
              History
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full xs:w-auto">
            <div className="relative flex-1 xs:flex-none">
              <Search className="absolute left-2.5 xxs:left-3 top-[9px] xxs:top-2.5 h-3.5 xxs:h-4 w-3.5 xxs:w-4 text-gray-400" />
              <Input
                placeholder="Search by LAN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 xxs:pl-10 h-8 xxs:h-10 text-xs xxs:text-sm w-full xs:w-[180px] sm:w-[200px] md:w-[300px]"
              />
            </div>

            <Popover open={isDateFilterOpen} onOpenChange={setIsDateFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={dateFrom || dateTo ? "default" : "outline"}
                  size="icon"
                  className="relative h-8 xxs:h-10 w-8 xxs:w-10"
                >
                  <Filter className="h-3.5 xxs:h-4 w-3.5 xxs:w-4" />
                  {(dateFrom || dateTo) && (
                    <span className="absolute -top-1 -right-1 h-2.5 xxs:h-3 w-2.5 xxs:w-3 rounded-full bg-primary" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3 xxs:p-4" align="end">
                <div className="space-y-3 xxs:space-y-4 max-h-[65vh] xxs:max-h-[70vh] overflow-y-auto">
                  <div className="space-y-2">
                    <h4 className="font-medium text-xs xxs:text-sm">Date Range</h4>
                    <div className="grid gap-2">
                      <div className="flex flex-col gap-1 xxs:gap-2">
                        <label className="text-xs xxs:text-sm text-muted-foreground">From</label>
                        <Button
                          variant="outline"
                          className={`h-8 xxs:h-9 text-xs xxs:text-sm justify-start text-left font-normal ${!dateFrom && "text-muted-foreground"}`}
                          onClick={() => setDateFrom(undefined)}
                        >
                          <CalendarIcon className="mr-2 h-3.5 xxs:h-4 w-3.5 xxs:w-4" />
                          {dateFrom ? format(dateFrom, "PP") : "Pick a date"}
                        </Button>
                      </div>
                      <div className="flex flex-col gap-1 xxs:gap-2">
                        <label className="text-xs xxs:text-sm text-muted-foreground">To</label>
                        <Button
                          variant="outline"
                          className={`h-8 xxs:h-9 text-xs xxs:text-sm justify-start text-left font-normal ${!dateTo && "text-muted-foreground"}`}
                          onClick={() => setDateTo(undefined)}
                        >
                          <CalendarIcon className="mr-2 h-3.5 xxs:h-4 w-3.5 xxs:w-4" />
                          {dateTo ? format(dateTo, "PP") : "Pick a date"}
                        </Button>
                      </div>
                    </div>
                    <div className="pt-2 xxs:pt-4">
                      <Calendar
                        mode="range"
                        selected={{
                          from: dateFrom,
                          to: dateTo,
                        }}
                        onSelect={(range) => {
                          setDateFrom(range?.from);
                          setDateTo(range?.to);
                        }}
                        numberOfMonths={isMobile ? 1 : 2}
                        className="rounded-md border max-w-full"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 xxs:pt-4 sticky bottom-0 bg-white">
                    <Button variant="outline" size="sm" onClick={clearDateFilter} className="h-7 xxs:h-8 text-xs">
                      Clear
                    </Button>
                    <Button size="sm" onClick={applyDateFilter} className="h-7 xxs:h-8 text-xs">
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-3 xxs:p-4 mt-2 xxs:mt-3 xs:mt-4">
          <TabsContent value="packets" className="mt-0 space-y-3 xxs:space-y-4 flex flex-col">
            <div className="flex flex-col xxs:flex-row justify-between items-start xxs:items-center gap-2 xxs:gap-0 mb-2 xxs:mb-3 xs:mb-4">
              <h3 className="text-base xxs:text-lg font-medium">Gold Packets</h3>

              {isMobile ? (
                <Popover open={showFilterMenu} onOpenChange={setShowFilterMenu}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 flex justify-between w-full xxs:w-[180px]"
                    >
                      <span>Filter: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[180px] p-2" align="end">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant={viewMode === "all" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setViewMode("all");
                          setShowFilterMenu(false);
                        }}
                        className="justify-start text-xs h-8"
                      >
                        All
                      </Button>
                      <Button
                        variant={viewMode === "pending" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setViewMode("pending");
                          setShowFilterMenu(false);
                        }}
                        className="justify-start text-xs h-8"
                      >
                        Pending
                      </Button>
                      <Button
                        variant={viewMode === "approved" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setViewMode("approved");
                          setShowFilterMenu(false);
                        }}
                        className="justify-start text-xs h-8"
                      >
                        Approved
                      </Button>
                      <Button
                        variant={viewMode === "rejected" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => {
                          setViewMode("rejected");
                          setShowFilterMenu(false);
                        }}
                        className="justify-start text-xs h-8"
                      >
                        Rejected
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("all")}
                    className="text-xs h-8"
                  >
                    All
                  </Button>
                  <Button
                    variant={viewMode === "pending" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("pending")}
                    className="text-xs h-8"
                  >
                    Pending
                  </Button>
                  <Button
                    variant={viewMode === "approved" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("approved")}
                    className="text-xs h-8"
                  >
                    Approved
                  </Button>
                  <Button
                    variant={viewMode === "rejected" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("rejected")}
                    className="text-xs h-8"
                  >
                    Rejected
                  </Button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <PacketList viewMode={viewMode} searchTerm={searchTerm} dateFrom={dateFrom} dateTo={dateTo} />
            </div>
          </TabsContent>

          <TabsContent value="submit" className="mt-0">
            <PacketForm />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="text-center py-4 xxs:py-6 sm:py-8">
              <h3 className="text-base xxs:text-lg font-medium mb-1 xxs:mb-2">Submission History</h3>
              <p className="text-xs xxs:text-sm text-muted-foreground">
                View your complete history of packet submissions
              </p>
              <div className="mt-4 xxs:mt-6 sm:mt-8">
                <PacketList viewMode="all" searchTerm="" showHistory />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default Dashboard;
