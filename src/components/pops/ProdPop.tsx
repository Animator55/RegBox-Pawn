import React from 'react'

type Props = {
  close: Function
}

export default function ProdPop({ close }: Props) {
  return <section className='back-blur confirm-spefic' onClick={(e) => {
    let target = e.target as HTMLDivElement
    if (target.className === "back-blur confirm-spefic") close()
  }}>
    <section className='pop'>
      ProdPop
    </section>
  </section>
}