import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const LegalLayout = ({ title, children }) => (
  <div className="min-h-screen bg-[#FAFBFE] flex flex-col">
    <Navbar />
    <div className="flex-1 max-w-4xl mx-auto px-6 py-12 lg:py-20 w-full">
      <h1 className="font-['Outfit'] text-3xl md:text-4xl font-black text-slate-900 mb-8">{title}</h1>
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 prose prose-slate max-w-none">
        {children}
      </div>
    </div>
    <Footer />
  </div>
)

export const Termeni = () => (
  <LegalLayout title="Termeni și Condiții">
    <p>Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
    
    <h3>1. Introducere</h3>
    <p>Acest site este operat de IdealClean. Accesând sau utilizând site-ul nostru, sunteți de acord să respectați acești Termeni și Condiții.</p>

    <h3>2. Produse și Prețuri</h3>
    <p>Ne rezervăm dreptul de a modifica prețurile produselor noastre în orice moment. Toate prețurile includ TVA conform legislației în vigoare.</p>

    <h3>3. Comenzi și Livrare</h3>
    <p>Prin plasarea unei comenzi, confirmați că toate detaliile furnizate sunt corecte. Livrarea se face prin curier rapid, cu plata ramburs la primirea coletului.</p>

    <h3>4. Proprietate Intelectuală</h3>
    <p>Tot conținutul de pe acest site (imagini, text, design) este proprietatea IdealClean și nu poate fi folosit fără acordul nostru scris.</p>
  </LegalLayout>
)

export const Confidentialitate = () => (
  <LegalLayout title="Politica de Confidențialitate">
    <p>Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
    
    <h3>1. Ce date colectăm</h3>
    <p>Colectăm doar datele strict necesare pentru procesarea și livrarea comenzilor: nume, prenume, număr de telefon, adresă de livrare și adresă de email.</p>

    <h3>2. Cum folosim datele</h3>
    <p>Datele dvs. sunt folosite exclusiv pentru:</p>
    <ul>
      <li>Procesarea și expedierea comenzilor</li>
      <li>Comunicarea cu dvs. privind statusul comenzii</li>
      <li>Îndeplinirea obligațiilor legale (facturare)</li>
    </ul>

    <h3>3. Protecția datelor</h3>
    <p>Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja datele dvs. personale împotriva accesului neautorizat. Datele sunt partajate doar cu partenerii noștri strict necesari pentru finalizarea comenzii (ex: firma de curierat).</p>

    <h3>4. Drepturile dvs.</h3>
    <p>Conform GDPR, aveți dreptul de acces, rectificare, ștergere și restricționare a prelucrării datelor dvs. Ne puteți contacta oricând la <strong>avidoshop0@gmail.com</strong> pentru exercitarea acestor drepturi.</p>
  </LegalLayout>
)

export const Retur = () => (
  <LegalLayout title="Politica de Retur">
    <p>Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
    
    <h3>1. Dreptul de Retragere</h3>
    <p>Conform OUG 34/2014, aveți dreptul de a returna produsele achiziționate online în termen de 14 zile calendaristice de la primirea lor, fără a invoca niciun motiv.</p>

    <h3>2. Condiții de Retur</h3>
    <p>Produsele trebuie returnate în aceeași stare în care au fost livrate, în ambalajul original, cu toate accesoriile și etichetele intacte, fără urme de utilizare (din motive de igienă și protecție a sănătății).</p>

    <h3>3. Procedura de Retur</h3>
    <p>Pentru a iniția un retur, vă rugăm să ne contactați la numărul de telefon: <strong>0741803646</strong> sau la adresa de email: <strong>avidoshop0@gmail.com</strong>. Costul transportului pentru retur este suportat de către client.</p>

    <h3>4. Rambursarea</h3>
    <p>Contravaloarea produselor va fi rambursată în termen de maxim 14 zile de la recepționarea și verificarea coletului retur de către noi, într-un cont bancar specificat de dvs.</p>
  </LegalLayout>
)
