import { Users } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMetric } from "@/types/metric";
import { DashboardFilter } from "@/types/dashboard-filter";

interface DashboardStatsProps {
  stats: DashboardMetric[];
  isLoading: boolean;
  onStatClick: (filter: DashboardFilter) => void;
}

export function DashboardStats({ stats, isLoading, onStatClick }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.key}
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
          onClick={() => stat.filterCriteria && onStatClick(stat.filterCriteria)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <h3 className="text-3xl font-bold mt-2">
                  {stat.count}
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                {stat.icon ? (
                  <DynamicIcon name={stat.icon} className="h-6 w-6 text-primary" />
                ) : (
                  <Users className="h-6 w-6 text-primary" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
