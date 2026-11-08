import { useEffect, useRef, useState } from 'react'

// <img> con estado de carga: muestra un esqueleto (o un spinner) hasta que la imagen llega.
// `className` va en el contenedor (tamaño, forma, borde); `imgClassName` en la imagen.
export const LoadingImage = ({
  src,
  alt = '',
  className = '',
  imgClassName = 'size-full object-cover',
  spinner = false,
  onError,
  ...rest
}) => {
  const [status, setStatus] = useState('loading')
  const ref = useRef(null)

  useEffect(() => {
    // Si la imagen ya estaba en caché, onLoad puede haber ocurrido antes de montar el handler
    const el = ref.current
    setStatus(el?.complete && el.naturalWidth > 0 ? 'loaded' : 'loading')
  }, [src])

  const loading = status === 'loading'

  return (
    <span className={`relative inline-block overflow-hidden ${spinner && loading ? 'min-h-56' : ''} ${className}`}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={(e) => { setStatus('error'); onError?.(e) }}
        className={`${imgClassName} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        {...rest}
      />
      {loading && (
        spinner
          ? (
            <span role="status" aria-label="Cargando imagen" className="absolute inset-0 flex items-center justify-center">
              <span className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            </span>
          )
          : <span aria-hidden className="absolute inset-0 animate-pulse bg-sunken" />
      )}
    </span>
  )
}
