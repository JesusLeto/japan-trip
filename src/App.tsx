import { useMemo } from 'react';
import { AppProvider } from './state/AppContext';
import { LocalStorageAdapter } from './storage/LocalStorageAdapter';
import { activeTrip } from './data';
import { Header } from './components/Header/Header';
import { Hero } from './components/Hero/Hero';
import { PreDepartureChecklist } from './components/checklist/PreDepartureChecklist';
import { ArrivalChecklist } from './components/checklist/ArrivalChecklist';
import { RouteSection } from './components/route/RouteSection';
import { ExportSection } from './components/ExportSection/ExportSection';
import { PrintDocument } from './components/ExportSection/PrintDocument';
import { Footer } from './components/Footer/Footer';

function App() {
  const adapter = useMemo(() => new LocalStorageAdapter(`travel-planner:${activeTrip.id}`), []);

  return (
    <AppProvider adapter={adapter} trip={activeTrip}>
      <div id="app">
        <Header />
        <Hero />
        <PreDepartureChecklist />
        <ArrivalChecklist />
        <RouteSection />
        <ExportSection />
        <Footer />
      </div>
      <PrintDocument />
    </AppProvider>
  );
}

export default App;
