# 🔧 Solución al Error de Orden de Hooks de React

## ❌ **Problema Identificado**
```
React has detected a change in the order of Hooks called by HomePage. 
This will lead to bugs and errors if not fixed. For more information, 
read the Rules of Hooks: https://react.dev/link/rules-of-hooks

Previous render            Next render
------------------------------------------------------
1. useContext                 useContext
2. useContext                 useContext
3. useMemo                    useMemo
4. useEffect                  useEffect
5. undefined                  useMemo
   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
```

## 🔍 **Causa del Problema**
El error ocurría porque **los hooks se estaban llamando en diferente orden** entre renders:

### **❌ Código Problemático:**
```typescript
export default function HomePage() {
  const { user, logout, isAuthenticated, loading } = useAuth() // Hook 1
  const router = useRouter() // Hook 2
  
  const fechaHoy = useMemo(() => { ... }, []) // Hook 3

  useEffect(() => { ... }, [isAuthenticated, loading, router]) // Hook 4

  // ❌ RETURN TEMPRANO - Los hooks de abajo no se ejecutan
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  // ❌ ESTOS HOOKS SE EJECUTAN CONDICIONALMENTE
  const fichas = useMemo(() => { ... }, [allData]) // Hook 5 - Solo a veces
  const [selectedFicha, setSelectedFicha] = useState<string>('') // Hook 6 - Solo a veces
  const filtered = useMemo(() => { ... }, [allData, selectedFicha]) // Hook 7 - Solo a veces
}
```

### **Problema:**
- **Render 1**: Hooks 1, 2, 3, 4 se ejecutan, luego return temprano
- **Render 2**: Hooks 1, 2, 3, 4, 5, 6, 7 se ejecutan
- **Resultado**: Orden de hooks inconsistente → Error de React

## ✅ **Solución Implementada**

### **Regla de Oro de React Hooks:**
> **"Siempre llama a los hooks en el mismo orden, en el nivel superior de tu función"**

### **✅ Código Corregido:**
```typescript
export default function HomePage() {
  const { user, logout, isAuthenticated, loading } = useAuth() // Hook 1
  const router = useRouter() // Hook 2
  
  // ✅ DATOS MOCK AL INICIO
  const allData: Row[] = [ ... ]

  // ✅ TODOS LOS HOOKS AL INICIO, ANTES DE CUALQUIER RETURN
  const fechaHoy = useMemo(() => { ... }, []) // Hook 3
  const fichas = useMemo(() => { ... }, [allData]) // Hook 4
  const [selectedFicha, setSelectedFicha] = useState<string>('') // Hook 5
  const filtered = useMemo(() => { ... }, [allData, selectedFicha]) // Hook 6

  useEffect(() => { ... }, [isAuthenticated, loading, router]) // Hook 7

  // ✅ RETURNS CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  if (loading) {
    return <LoadingSpinner message="Verificando autenticación..." />
  }

  if (!isAuthenticated) {
    return null
  }

  // ✅ RENDER PRINCIPAL
  return ( ... )
}
```

## 🔄 **Flujo Corregido**

### **Render 1 (Loading)**
```
1. useAuth() ✅
2. useRouter() ✅
3. useMemo(fechaHoy) ✅
4. useMemo(fichas) ✅
5. useState(selectedFicha) ✅
6. useMemo(filtered) ✅
7. useEffect() ✅
8. return <LoadingSpinner /> ✅
```

### **Render 2 (Autenticado)**
```
1. useAuth() ✅
2. useRouter() ✅
3. useMemo(fechaHoy) ✅
4. useMemo(fichas) ✅
5. useState(selectedFicha) ✅
6. useMemo(filtered) ✅
7. useEffect() ✅
8. return <MainContent /> ✅
```

### **Resultado**
```
✅ Mismo orden de hooks en todos los renders
✅ No hay cambios en el orden
✅ React funciona correctamente
```

## 📋 **Reglas de Hooks de React**

### **✅ SIEMPRE HACER:**
1. **Llamar hooks solo en el nivel superior** (no dentro de loops, condiciones, o funciones anidadas)
2. **Mismo orden en cada render** (todos los hooks se ejecutan siempre)
3. **Hooks antes de returns condicionales**
4. **Hooks antes de lógica condicional**

### **❌ NUNCA HACER:**
1. **Hooks dentro de if/else**
2. **Hooks dentro de loops**
3. **Hooks después de returns tempranos**
4. **Hooks condicionales**

## 🛠️ **Patrón Recomendado**

```typescript
function MiComponente() {
  // 1. ✅ Hooks de estado y contexto
  const { user, loading } = useAuth()
  const router = useRouter()
  
  // 2. ✅ Datos y constantes
  const data = [ ... ]
  
  // 3. ✅ Todos los hooks (useState, useMemo, useEffect, etc.)
  const [state, setState] = useState()
  const memoized = useMemo(() => { ... }, [deps])
  const filtered = useMemo(() => { ... }, [deps])
  
  useEffect(() => { ... }, [deps])
  
  // 4. ✅ Lógica condicional y returns
  if (loading) return <Loading />
  if (!user) return <Login />
  
  // 5. ✅ Render principal
  return <MainContent />
}
```

## 🧪 **Cómo Verificar la Solución**

### 1. **Abrir DevTools**
- Ir a `http://localhost:3000/`
- Abrir DevTools → Console
- No debería haber errores de hooks

### 2. **Verificar Estados**
- Página debería cargar sin errores
- Transiciones entre loading y contenido funcionan
- No hay warnings de React

### 3. **Probar Navegación**
- Login → Página principal
- Logout → Login
- Recargar página

## ✅ **Resultado Final**

- ❌ **Antes**: Error de orden de hooks, renders inconsistentes
- ✅ **Después**: Hooks en orden correcto, renders consistentes
- ✅ **Performance**: Mejorada con hooks optimizados
- ✅ **Estabilidad**: Sin errores de React
- ✅ **Mantenibilidad**: Código más limpio y predecible

## 📝 **Notas Importantes**

- **Orden de hooks**: Crítico para el funcionamiento de React
- **Returns tempranos**: Solo después de todos los hooks
- **Hooks condicionales**: Nunca usar, siempre ejecutar todos
- **Linting**: ESLint puede detectar violaciones de reglas de hooks

¡El error de hooks está completamente solucionado! 🎉
