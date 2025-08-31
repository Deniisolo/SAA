'use client'
import { useMemo, useState } from 'react'
import clsx from 'clsx'

/** ---------- Tipos ---------- */
type Perfil = {
  id: string
  nombre: 'Admin' | 'Instructor' | 'Aprendiz' | string
  puedeCrear?: boolean
  puedeEditar?: boolean
  puedeEliminar?: boolean
  puedeVerReportes?: boolean
}

type CentroFormacion = {
  id: string
  nombre: string
  ciudad: string
  direccion: string
  codigo?: string
}

/** ---------- Datos MOCK (cámbialos por tu backend) ---------- */
const MOCK_PERFILES: Perfil[] = [
  { id: 'p1', nombre: 'Admin', puedeCrear: true, puedeEditar: true, puedeEliminar: true, puedeVerReportes: true },
  { id: 'p2', nombre: 'Instructor', puedeCrear: true, puedeEditar: true, puedeEliminar: false, puedeVerReportes: true },
  { id: 'p3', nombre: 'Aprendiz', puedeCrear: false, puedeEditar: false, puedeEliminar: false, puedeVerReportes: false },
]

const MOCK_CENTROS: CentroFormacion[] = [
  { id: 'c1', nombre: 'Centro de Diseño y Metrología', ciudad: 'Bogotá', direccion: 'Cra 48 #91-50', codigo: 'CDM-01' },
  { id: 'c2', nombre: 'Centro de Electricidad y Automatización', ciudad: 'Medellín', direccion: 'Cl 30 #55-90', codigo: 'CEA-02' },
]

/** ---------- UI helpers ---------- */
function Section({ title, children }: {title:string; children:React.ReactNode}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, children }: {label:string; children:React.ReactNode}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </label>
  )
}

/** ---------- Página ---------- */
export default function AdminPage() {
  const [tab, setTab] = useState<'perfiles'|'centros'>('perfiles')

  // Estado Perfiles
  const [perfiles, setPerfiles] = useState<Perfil[]>(MOCK_PERFILES)
  const [perfilDraft, setPerfilDraft] = useState<Perfil>({
    id: '',
    nombre: '',
    puedeCrear: false,
    puedeEditar: false,
    puedeEliminar: false,
    puedeVerReportes: false,
  })
  const [editPerfilId, setEditPerfilId] = useState<string | null>(null)

  // Estado Centros
  const [centros, setCentros] = useState<CentroFormacion[]>(MOCK_CENTROS)
  const [centroDraft, setCentroDraft] = useState<CentroFormacion>({
    id: '',
    nombre: '',
    ciudad: '',
    direccion: '',
    codigo: '',
  })
  const [editCentroId, setEditCentroId] = useState<string | null>(null)

  /** ------- Acciones Perfiles ------- */
  const savePerfil = () => {
    if (!perfilDraft.nombre.trim()) return
    if (editPerfilId) {
      setPerfiles(prev => prev.map(p => p.id === editPerfilId ? { ...perfilDraft, id: editPerfilId } : p))
      setEditPerfilId(null)
    } else {
      const id = crypto.randomUUID()
      setPerfiles(prev => [{ ...perfilDraft, id }, ...prev])
    }
    setPerfilDraft({ id:'', nombre:'', puedeCrear:false, puedeEditar:false, puedeEliminar:false, puedeVerReportes:false })
  }

  const editPerfil = (p: Perfil) => {
    setPerfilDraft(p)
    setEditPerfilId(p.id)
  }

  const deletePerfil = (id: string) => {
    setPerfiles(prev => prev.filter(p => p.id !== id))
    if (editPerfilId === id) setEditPerfilId(null)
  }

  /** ------- Acciones Centros ------- */
  const saveCentro = () => {
    if (!centroDraft.nombre.trim() || !centroDraft.ciudad.trim() || !centroDraft.direccion.trim()) return
    if (editCentroId) {
      setCentros(prev => prev.map(c => c.id === editCentroId ? { ...centroDraft, id: editCentroId } : c))
      setEditCentroId(null)
    } else {
      const id = crypto.randomUUID()
      setCentros(prev => [{ ...centroDraft, id }, ...prev])
    }
    setCentroDraft({ id:'', nombre:'', ciudad:'', direccion:'', codigo:'' })
  }

  const editCentro = (c: CentroFormacion) => {
    setCentroDraft(c)
    setEditCentroId(c.id)
  }

  const deleteCentro = (id: string) => {
    setCentros(prev => prev.filter(c => c.id !== id))
    if (editCentroId === id) setEditCentroId(null)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Panel de Administración</h1>
        <p className="text-sm text-gray-500">Gestiona perfiles, centros de formación y más.</p>
      </header>

      {/* Layout: sidebar + contenido */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px,1fr]">
        {/* Sidebar */}
        <aside className="rounded-2xl border border-gray-200 bg-white p-3">
          <ul className="flex flex-col">
            <li>
              <button
                className={clsx(
                  'w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50',
                  tab === 'perfiles' && 'bg-gray-100 font-semibold'
                )}
                onClick={() => setTab('perfiles')}
              >
                👤 Perfiles & Permisos
              </button>
            </li>
            <li>
              <button
                className={clsx(
                  'w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50',
                  tab === 'centros' && 'bg-gray-100 font-semibold'
                )}
                onClick={() => setTab('centros')}
              >
                🏫 Centros de formación
              </button>
            </li>

            {/* Futuras secciones: descomenta/duplica cuando las implementes */}
            {/* <li><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">🎓 Programas</button></li>
            <li><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">📑 Fichas</button></li>
            <li><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">🏠 Ambientes</button></li>
            <li><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">🕒 Horarios</button></li>
            <li><button className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50">👥 Usuarios</button></li> */}
          </ul>
        </aside>

        {/* Contenido */}
        <main className="space-y-6">
          {tab === 'perfiles' && (
            <>
              <Section title="Crear / Editar perfil">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nombre del perfil">
                    <input
                      className="rounded-xl border px-3 py-2"
                      value={perfilDraft.nombre}
                      onChange={e => setPerfilDraft(p => ({...p, nombre: e.target.value}))}
                      placeholder="Ej: Coordinador"
                    />
                  </Field>

                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={!!perfilDraft.puedeCrear}
                        onChange={e => setPerfilDraft(p => ({...p, puedeCrear: e.target.checked}))}/>
                      <span className="text-sm">Puede crear</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={!!perfilDraft.puedeEditar}
                        onChange={e => setPerfilDraft(p => ({...p, puedeEditar: e.target.checked}))}/>
                      <span className="text-sm">Puede editar</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={!!perfilDraft.puedeEliminar}
                        onChange={e => setPerfilDraft(p => ({...p, puedeEliminar: e.target.checked}))}/>
                      <span className="text-sm">Puede eliminar</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox"
                        checked={!!perfilDraft.puedeVerReportes}
                        onChange={e => setPerfilDraft(p => ({...p, puedeVerReportes: e.target.checked}))}/>
                      <span className="text-sm">Puede ver reportes</span>
                    </label>
                  </div>

                  <div className="sm:col-span-2 flex gap-3">
                    <button onClick={savePerfil} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      {editPerfilId ? 'Guardar cambios' : 'Crear perfil'}
                    </button>
                    {editPerfilId && (
                      <button onClick={() => { setEditPerfilId(null); setPerfilDraft({ id:'', nombre:'', puedeCrear:false, puedeEditar:false, puedeEliminar:false, puedeVerReportes:false })}}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Perfiles existentes">
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="p-2">Perfil</th>
                        <th className="p-2">Crear</th>
                        <th className="p-2">Editar</th>
                        <th className="p-2">Eliminar</th>
                        <th className="p-2">Ver reportes</th>
                        <th className="p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {perfiles.map(p => (
                        <tr key={p.id} className="border-t">
                          <td className="p-2 font-medium">{p.nombre}</td>
                          <td className="p-2">{p.puedeCrear ? 'Sí' : 'No'}</td>
                          <td className="p-2">{p.puedeEditar ? 'Sí' : 'No'}</td>
                          <td className="p-2">{p.puedeEliminar ? 'Sí' : 'No'}</td>
                          <td className="p-2">{p.puedeVerReportes ? 'Sí' : 'No'}</td>
                          <td className="p-2 flex gap-2">
                            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => editPerfil(p)}>Editar</button>
                            <button className="rounded-lg border px-3 py-1 hover:bg-red-50" onClick={() => deletePerfil(p.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}

          {tab === 'centros' && (
            <>
              <Section title="Crear / Editar centro de formación">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Nombre">
                    <input className="rounded-xl border px-3 py-2"
                      value={centroDraft.nombre}
                      onChange={e => setCentroDraft(c => ({...c, nombre: e.target.value}))}
                      placeholder="Ej: Centro de Diseño y Metrología" />
                  </Field>
                  <Field label="Ciudad">
                    <input className="rounded-xl border px-3 py-2"
                      value={centroDraft.ciudad}
                      onChange={e => setCentroDraft(c => ({...c, ciudad: e.target.value}))}
                      placeholder="Ej: Bogotá" />
                  </Field>
                  <Field label="Dirección">
                    <input className="rounded-xl border px-3 py-2"
                      value={centroDraft.direccion}
                      onChange={e => setCentroDraft(c => ({...c, direccion: e.target.value}))}
                      placeholder="Ej: Cra 48 #91-50" />
                  </Field>
                  <Field label="Código (opcional)">
                    <input className="rounded-xl border px-3 py-2"
                      value={centroDraft.codigo ?? ''}
                      onChange={e => setCentroDraft(c => ({...c, codigo: e.target.value}))}
                      placeholder="Ej: CDM-01" />
                  </Field>

                  <div className="sm:col-span-2 flex gap-3">
                    <button onClick={saveCentro} className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                      {editCentroId ? 'Guardar cambios' : 'Crear centro'}
                    </button>
                    {editCentroId && (
                      <button onClick={() => { setEditCentroId(null); setCentroDraft({ id:'', nombre:'', ciudad:'', direccion:'', codigo:'' })}}
                        className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Centros existentes">
                <div className="overflow-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="p-2">Nombre</th>
                        <th className="p-2">Ciudad</th>
                        <th className="p-2">Dirección</th>
                        <th className="p-2">Código</th>
                        <th className="p-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {centros.map(c => (
                        <tr key={c.id} className="border-t">
                          <td className="p-2 font-medium">{c.nombre}</td>
                          <td className="p-2">{c.ciudad}</td>
                          <td className="p-2">{c.direccion}</td>
                          <td className="p-2">{c.codigo || '—'}</td>
                          <td className="p-2 flex gap-2">
                            <button className="rounded-lg border px-3 py-1 hover:bg-gray-50" onClick={() => editCentro(c)}>Editar</button>
                            <button className="rounded-lg border px-3 py-1 hover:bg-red-50" onClick={() => deleteCentro(c.id)}>Eliminar</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
