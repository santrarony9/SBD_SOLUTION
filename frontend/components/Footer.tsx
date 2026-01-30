export default function Footer() {
    return (
        <footer className="bg-brand-dark text-gray-300 py-12 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">

                {/* Brand */}
                <div className="col-span-1 md:col-span-1">
                    <h2 className="font-serif text-xl text-brand-gold mb-4">SPARK BLUE DIAMOND</h2>
                    <p className="text-sm leading-relaxed mb-4">
                        Crafting elegance with transparency. IGI Certified Diamonds and BIS Hallmarked Gold.
                    </p>
                </div>

                {/* Links */}
                <div>
                    <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Explore</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/shop" className="hover:text-brand-gold transition-colors">Rings</a></li>
                        <li><a href="/shop" className="hover:text-brand-gold transition-colors">Necklaces</a></li>
                        <li><a href="/shop" className="hover:text-brand-gold transition-colors">Earrings</a></li>
                        <li><a href="/shop" className="hover:text-brand-gold transition-colors">Solitaires</a></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Company</h3>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/about" className="hover:text-brand-gold transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-brand-gold transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-brand-gold transition-colors">Terms of Service</a></li>
                        <li><a href="/faq" className="hover:text-brand-gold transition-colors">FAQ</a></li>
                    </ul>
                </div>

                {/* Trust */}
                <div>
                    <h3 className="text-white font-semibold uppercase tracking-wider mb-4">Certified Trust</h3>
                    <div className="flex space-x-4">
                        <div className="border border-gray-600 p-2 text-xs text-center rounded">
                            <span className="block text-brand-gold font-bold">IGI</span>
                            Certified
                        </div>
                        <div className="border border-gray-600 p-2 text-xs text-center rounded">
                            <span className="block text-brand-gold font-bold">BIS</span>
                            Hallmarked
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} Spark Blue Diamond. All rights reserved.
            </div>
        </footer>
    );
}
