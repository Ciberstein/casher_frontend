import React, { useState } from 'react'
import { Button } from '../../../../elements/user/Button'

export const SettingsMenu = ({ section, setSection }) => {

  return (
    <nav className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <Button
        variant={section == 1 ? "normal" : "outline"} 
        onClick={() => setSection(1)}
      >
        General
      </Button>
      <Button 
        variant={section == 2 ? "normal" : "outline"} 
        onClick={() => setSection(2)}
      >
        Seguridad
      </Button>
    </nav>
  )
}
