import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const LegalLayout = ({ title, children }) => (
  <div className="min-h-screen bg-[#FAFBFE] flex flex-col font-sans">
    <Navbar />
    
    {/* Page Header */}
    <div className="pt-32 pb-20 bg-gradient-to-br from-[#0F172A] to-[#0077B6] relative overflow-hidden">
      <div className="absolute inset-0 bg-white/5 opacity-20" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h1 className="font-['Outfit'] text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight drop-shadow-lg">{title}</h1>
        <div className="w-24 h-1.5 bg-gradient-to-r from-[#2EC4B6] to-[#5EEAD4] mx-auto rounded-full shadow-[0_0_15px_rgba(46,196,182,0.5)]"></div>
      </div>
    </div>

    {/* Content Container */}
    <div className="flex-1 max-w-4xl mx-auto px-6 py-8 -mt-12 w-full relative z-20 mb-20">
      <div className="bg-white rounded-[2rem] p-8 md:p-14 shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-slate-100 text-slate-600 leading-relaxed text-[17px]">
        {children}
      </div>
    </div>
    
    <Footer />
  </div>
)

const SectionTitle = ({ children }) => (
  <h3 className="font-['Outfit'] text-2xl font-extrabold text-slate-800 mt-12 mb-5 flex items-center gap-4">
    <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0077B6] to-[#00B4D8] text-white flex items-center justify-center shadow-lg shadow-[#0077B6]/20 shrink-0">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
    </span>
    {children}
  </h3>
)

const Paragraph = ({ children }) => (
  <p className="mb-6 text-slate-600 leading-8 pl-14">{children}</p>
)

const List = ({ children }) => (
  <ul className="space-y-4 my-8 ml-14 bg-slate-50/80 p-8 rounded-2xl border border-slate-100 shadow-inner">
    {children}
  </ul>
)

const ListItem = ({ children }) => (
  <li className="flex items-start gap-4 text-slate-700">
    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
    </span>
    <span className="pt-0.5">{children}</span>
  </li>
)

const Highlight = ({ children }) => (
  <strong className="font-bold text-[#0077B6]">{children}</strong>
)

const DateUpdate = ({ date }) => (
  <div className="flex justify-center mb-10">
    <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-500 shadow-sm">
      <span className="text-lg">📅</span> 
      <span className="uppercase tracking-wider text-[11px] text-slate-400">Ultima actualizare:</span>
      <span className="text-slate-700">{date}</span>
    </div>
  </div>
)

export const Termeni = () => (
  <LegalLayout title="Termeni și Condiții">
    <DateUpdate date={new Date().toLocaleDateString('ro-RO')} />
    
    <SectionTitle>1. Introducere</SectionTitle>
    <Paragraph>
      Acest site este operat de <Highlight>IdealClean</Highlight>. Accesând sau utilizând site-ul nostru, sunteți de acord să respectați acești Termeni și Condiții. Vă rugăm să citiți cu atenție rândurile de mai jos înainte de a plasa o comandă.
    </Paragraph>

    <SectionTitle>2. Produse și Prețuri</SectionTitle>
    <Paragraph>
      Ne rezervăm dreptul de a modifica prețurile produselor noastre în orice moment. Toate prețurile includ TVA conform legislației în vigoare, iar eventualele oferte sunt valabile în limita stocului disponibil.
    </Paragraph>

    <SectionTitle>3. Comenzi și Livrare</SectionTitle>
    <Paragraph>
      Prin plasarea unei comenzi, confirmați că toate detaliile furnizate sunt corecte. Livrarea se face prin curier rapid, cu plata ramburs la primirea coletului. Ne străduim să expediem comenzile în cel mai scurt timp posibil.
    </Paragraph>

    <SectionTitle>4. Proprietate Intelectuală</SectionTitle>
    <Paragraph>
      Tot conținutul de pe acest site (imagini, text, design) este proprietatea exclusivă <Highlight>IdealClean</Highlight> și nu poate fi folosit, copiat sau distribuit fără acordul nostru scris în prealabil.
    </Paragraph>
  </LegalLayout>
)

export const Confidentialitate = () => (
  <LegalLayout title="Politica de Confidențialitate">
    <DateUpdate date={new Date().toLocaleDateString('ro-RO')} />
    
    <SectionTitle>1. Ce date colectăm</SectionTitle>
    <Paragraph>
      Pentru a vă putea onora comenzile în condiții optime, colectăm doar datele strict necesare pentru procesarea și livrarea acestora: <Highlight>nume, prenume, număr de telefon, adresă de livrare și adresă de email.</Highlight>
    </Paragraph>

    <SectionTitle>2. Cum folosim datele</SectionTitle>
    <Paragraph>Datele dvs. sunt folosite exclusiv pentru:</Paragraph>
    <List>
      <ListItem>Procesarea, ambalarea și expedierea comenzilor plasate.</ListItem>
      <ListItem>Comunicarea cu dvs. privind statusul comenzii și confirmarea telefonică.</ListItem>
      <ListItem>Îndeplinirea obligațiilor legale (facturare, contabilitate).</ListItem>
    </List>

    <SectionTitle>3. Protecția datelor</SectionTitle>
    <Paragraph>
      Implementăm măsuri de securitate tehnice și organizatorice pentru a proteja datele dvs. personale împotriva accesului neautorizat. Datele sunt partajate <Highlight>doar cu partenerii noștri strict necesari</Highlight> pentru finalizarea comenzii (ex: firma de curierat, procesatorul de facturi).
    </Paragraph>

    <SectionTitle>4. Drepturile dvs.</SectionTitle>
    <Paragraph>
      Conform Regulamentului General privind Protecția Datelor (GDPR), aveți dreptul de acces, rectificare, ștergere și restricționare a prelucrării datelor dvs. Ne puteți contacta oricând la <Highlight>avidoshop0@gmail.com</Highlight> pentru exercitarea acestor drepturi, iar noi vom răspunde solicitării în cel mai scurt timp.
    </Paragraph>
  </LegalLayout>
)

export const Retur = () => (
  <LegalLayout title="Politica de Retur">
    <DateUpdate date={new Date().toLocaleDateString('ro-RO')} />
    
    <SectionTitle>1. Dreptul de Retragere</SectionTitle>
    <Paragraph>
      Conform <Highlight>OUG 34/2014</Highlight>, aveți dreptul de a returna produsele achiziționate online în termen de <Highlight>14 zile calendaristice</Highlight> de la primirea lor, fără a fi nevoit să invocați niciun motiv. Dorim ca fiecare client să fie pe deplin mulțumit de produsele noastre.
    </Paragraph>

    <SectionTitle>2. Condiții de Retur</SectionTitle>
    <Paragraph>
      Produsele trebuie returnate în aceeași stare în care au fost livrate, în ambalajul original, cu toate accesoriile și etichetele intacte. Din motive de protecție a sănătății și de igienă, <Highlight>nu se acceptă returul produselor desigilate sau care prezintă urme de utilizare.</Highlight>
    </Paragraph>

    <SectionTitle>3. Procedura de Retur</SectionTitle>
    <Paragraph>Pentru a iniția un retur, vă rugăm să urmați acești pași:</Paragraph>
    <List>
      <ListItem>Contactați-ne la numărul de telefon <Highlight>0741803646</Highlight> sau prin email la <Highlight>avidoshop0@gmail.com</Highlight>.</ListItem>
      <ListItem>Ambalați produsul corespunzător pentru a preveni deteriorarea pe durata transportului.</ListItem>
      <ListItem>Costul transportului pentru retur este suportat integral de către client.</ListItem>
    </List>

    <SectionTitle>4. Rambursarea Sumelor</SectionTitle>
    <Paragraph>
      Contravaloarea produselor va fi rambursată în termen de <Highlight>maxim 14 zile</Highlight> de la recepționarea și verificarea coletului retur de către noi. Rambursarea se va face într-un cont bancar valid specificat de dvs. la momentul cererii de retur.
    </Paragraph>
  </LegalLayout>
)
