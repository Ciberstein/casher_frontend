import React, { useState } from 'react'
import { SettingsMenu } from './partials/SettingsMenu';
import { GeneralSection } from './partials/GeneralSection';
import { SecuritySection } from './partials/SecuritySection';

export const SettingsPage = () => {

  const [section, setSection] = useState(1);

  return (
    <div className="grid grid-cols-1 gap-6 sm:max-w-screen-sm m-auto">
      <SettingsMenu section={section} setSection={setSection} />
      {  section == 1 && <GeneralSection /> }
      {  section == 2 && <SecuritySection /> }
    </div>
  )
}
