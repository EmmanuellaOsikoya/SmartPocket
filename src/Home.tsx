import React from "react";
// This will be the main page of operations for the SmartPocket application
const Home: React.FC = () => {
    return (
        <div className="p-10">
            <h1 className="text-3xl font-bold mb-6">Welcome to SmartPocket</h1>
            <h2 className="text-2xl font-semibold mb-4">What would you like to do?</h2>

            <a href="/expense-categorisation" className="text-blue-500 hover:underline">Put my expenditure into categories</a>
            
        </div>
    );
};

export default Home;