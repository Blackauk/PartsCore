/**
 * Shared layout for authentication pages
 */
export default function AuthLayout({ brand = { name: 'Core Stock', logoUrl: '/brand.svg' }, children }) {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Logo/Name */}
        <div className="text-center mb-8">
          {brand.logoUrl ? (
            <img 
              src={brand.logoUrl} 
              alt={brand.name} 
              className="h-12 mx-auto mb-4"
              onError={(e) => {
                // Fallback to text if logo fails to load
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <h1 className="text-2xl font-bold text-zinc-100" style={{ display: brand.logoUrl ? 'none' : 'block' }}>
            {brand.name}
          </h1>
        </div>

        {/* Auth Form Card */}
        <div className="card p-6 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

