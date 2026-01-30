export default function AdminDashboard() {
    return (
        <div className="min-h-screen bg-gray-100 flex pb-20">

            {/* Sidebar - simplified */}
            <div className="w-64 bg-brand-navy text-white min-h-screen p-4">
                <h2 className="text-xl font-bold font-serif mb-8 text-brand-gold">Admin Panel</h2>
                <ul className="space-y-4 text-sm">
                    <li className="font-bold text-brand-gold">Masters</li>
                    <li className="pl-4 opacity-80 cursor-pointer hover:text-white">Gold Prices</li>
                    <li className="pl-4 opacity-80 cursor-pointer hover:text-white">Diamond Prices</li>
                    <li className="pl-4 opacity-80 cursor-pointer hover:text-white">Charges</li>
                    <li className="font-bold text-brand-gold mt-4">Products</li>
                    <li className="pl-4 opacity-80 cursor-pointer hover:text-white">Add New Product</li>
                    <li className="pl-4 opacity-80 cursor-pointer hover:text-white">Manage Products</li>
                </ul>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-serif text-brand-navy mb-8">Master Configuration</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Gold Master */}
                    <div className="bg-white p-6 rounded shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Gold Prices (Per 10g)</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm">24K Gold</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={72000} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm">22K Gold</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={66000} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm">18K Gold</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={54000} />
                            </div>
                            <button className="bg-brand-navy text-white px-4 py-2 rounded text-sm w-full mt-4">Update Gold Rates</button>
                        </div>
                    </div>

                    {/* Diamond Master */}
                    <div className="bg-white p-6 rounded shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Diamond Prices (Per Carat)</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm">VVS1</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={60000} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm">VS1</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={45000} />
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-sm">SI1</label>
                                <input type="number" className="border p-2 rounded w-32" defaultValue={32000} />
                            </div>
                            <button className="bg-brand-navy text-white px-4 py-2 rounded text-sm w-full mt-4">Update Diamond Rates</button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}
