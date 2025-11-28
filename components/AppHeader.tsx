import logoUrl from '@assets/logo biker\'s club noisy le grand_1763999912809.png';

export default function AppHeader() {
  return (
    <header className="w-full py-4 px-6 flex justify-center border-b-2 border-primary">
      <img 
        src={logoUrl} 
        alt="Biker's Club Noisy le Grand" 
        className="h-20 object-contain"
        data-testid="logo-club"
      />
    </header>
  );
}
