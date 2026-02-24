import { Home as HomeIcon, Refrigerator, ChefHat } from 'lucide-react';
import { AppTab } from '@/types';
import { TabButton } from './TabButton';

type NavBarProps = {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
};

export const NavBar = ({ activeTab, onTabChange }: NavBarProps) => (
  <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 backdrop-blur-xl border-t border-slate-100 safe-area-bottom z-40">
    <div className="flex justify-around items-center h-16">
      <TabButton
        active={activeTab === 'home'}
        onClick={() => onTabChange('home')}
        icon={HomeIcon}
        label="Home"
      />
      <TabButton
        active={activeTab === 'ingredients'}
        onClick={() => onTabChange('ingredients')}
        icon={Refrigerator}
        label="Fridge"
      />
      <TabButton
        active={activeTab === 'recipes'}
        onClick={() => onTabChange('recipes')}
        icon={ChefHat}
        label="Recipes"
      />
    </div>
  </nav>
);
