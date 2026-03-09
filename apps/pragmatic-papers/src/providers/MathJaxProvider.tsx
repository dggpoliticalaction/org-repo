import dynamic from 'next/dynamic'

const MathJaxContext = dynamic(
  () => import('better-react-mathjax').then((mod) => mod.MathJaxContext),
  { ssr: true },
)

export const MathJaxProvider: React.FC<{
  enableMathRendering: boolean | null | undefined
  children: React.ReactNode
}> = ({ enableMathRendering, children }) => {
  if (!enableMathRendering) return children
  return <MathJaxContext>{children}</MathJaxContext>
}
