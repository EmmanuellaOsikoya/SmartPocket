import React from "react";

interface Props {
  results: any;
  onReset?: () => void;
  showActions?: boolean;
}

const ProgressReportView: React.FC<Props> = ({
  results,
  onReset,
  showActions = false,
}) => {
  if (!results) return null;


  return (
    <div className="mt-10 space-y-8 max-w-4xl mx-auto">
      {/* OVERALL */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Overall Budget Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Monthly Budget</p>
            <p className="text-2xl font-bold text-blue-600">
              €{results.budgetTotal.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-800">
              €{results.currentTotal.toFixed(2)}
            </p>
          </div>

          <div className="text-center">
            <p className="text-gray-600 text-sm mb-1">
              {results.overallOverUnder <= 0
                ? "Under Budget"
                : "Over Budget"}
            </p>
            <p
              className={`text-2xl font-bold ${
                results.overallOverUnder <= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              €{Math.abs(results.overallOverUnder).toFixed(2)}
            </p>
          </div>
        </div>

        <div
          className={`text-center py-4 rounded-lg ${
            results.overallOverUnder <= 0
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          <p className="text-lg font-semibold">
            {results.overallOverUnder <= 0
              ? "Great job! You stayed within your budget!"
              : "You went over your budget this month"}
          </p>
        </div>
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Category Breakdown
        </h2>

        <div className="space-y-4">
          {results.categories.map((cat: any) => {
            const isOverBudget = cat.overUnder > 0;
            const percentage =
              cat.budget > 0 ? (cat.current / cat.budget) * 100 : 0;

            return (
              <div
                key={cat.category}
                className={`border-l-4 p-4 rounded ${
                  isOverBudget
                    ? "border-red-500 bg-red-50"
                    : "border-green-500 bg-green-50"
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-lg">
                    {cat.category}
                  </h3>
                  <span
                    className={`font-bold ${
                      isOverBudget
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {isOverBudget ? "OVER" : "UNDER"}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Budget</p>
                    <p className="font-semibold">
                      €{cat.budget.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">Spent</p>
                    <p className="font-semibold">
                      €{cat.current.toFixed(2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-600">
                      {isOverBudget ? "Over by" : "Under by"}
                    </p>
                    <p
                      className={`font-bold ${
                        isOverBudget
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      €{Math.abs(cat.overUnder).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        isOverBudget
                          ? "bg-red-600"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-right">
                    {percentage.toFixed(0)}% of budget used
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ACTION BUTTONS (optional) */}
      {showActions && (
        <div className="flex justify-center gap-4">
          <button
            onClick={onReset}
            className="bg-gray-500 text-white px-6 py-3 rounded hover:bg-gray-600 transition"
          >
            Track Another Month
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgressReportView;
