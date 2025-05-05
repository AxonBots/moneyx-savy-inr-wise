
import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PieChartProps {
  title: string;
  data: {
    name: string;
    value: number;
    color: string;
    percentage: string;
  }[];
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({ title, data, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-64 flex flex-col md:flex-row items-center justify-center">
          <div className="w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), '']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-4 md:mt-0">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm font-medium">{formatCurrency(item.value)} <span className="text-xs text-gray-500">({item.percentage})</span></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
