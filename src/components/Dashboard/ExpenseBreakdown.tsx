import { useEffect, useRef, useState } from "react";
import { Card } from "../common/Card";
import { formatCurrency, getChartColors } from "../../utils/helpers";
import { Chart, PieController, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
Chart.register(PieController, ArcElement, Tooltip, Legend);

interface MonthlyDataPoint {
  // Renamed for clarity if passed as prop
  name: string;
  total: number;
}

interface ExpenseBreakdownProps {
  title?: string;
  description?: string;
  data: MonthlyDataPoint[]; // Added data prop
}

export const ExpenseBreakdown: React.FC<ExpenseBreakdownProps> = ({
  title = "Expense Breakdown",
  description,
  data, // Use data from props
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [hasData, setHasData] = useState(true);

  useEffect(() => {
    if (!chartRef.current) return;

    // Use data from props
    const categories = data.map((d) => d.name);
    const values = data.map((d) => d.total);

    if (data.length === 0) {
      setHasData(false);
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
      return;
    }
    setHasData(true);

    const chartData = {
      labels: categories,
      datasets: [
        {
          data: values, // Use processed values
          backgroundColor: getChartColors(),
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    };

    if (chartInstance.current) {
      chartInstance.current.data = chartData;
      chartInstance.current.update();
    } else {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "60%",
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#A0AEC0",
                padding: 15,
                boxWidth: 12,
                font: { size: 12 },
              },
            },
            tooltip: {
              backgroundColor: "rgba(20, 20, 35, 0.85)",
              borderColor: "rgba(128, 90, 213, 0.4)",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 16,
              titleColor: "#FFFFFF",
              bodyColor: "#D1D5DB",
              bodyFont: { size: 14 },
              callbacks: {
                label: (context) => {
                  const value = context.raw as number;
                  return `${context.label}: ${formatCurrency(value)}`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]); // Depend on data prop

  return (
    <Card
      title={title}
      description={description}
      variant="glass"
      glowEffect
      titleGradient
      titleIcon={
        <svg
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
          />
        </svg>
      }
      className="h-[30rem]"
    >
      <div className="flex flex-col h-full justify-center">
        {hasData ? (
          <div className="h-[28rem] relative">
            <canvas ref={chartRef} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-gray-500 py-20 text-lg">
              No expense data for the current filter.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
