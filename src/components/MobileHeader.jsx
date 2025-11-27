import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function MobileHeader( {logout} ) {
  const { user } = useContext(AuthContext);

  return (
    // md:hidden significa: "ocúltame en pantallas medianas o más grandes"
    <div className="bg-[#8B5E3C] text-white p-6 pt-8 pb-12 rounded-b-[30px] shadow-md md:hidden relative z-10">
      <div className="flex justify-between items-center">
        <div>
           {/* Saludo dinámico */}
          <h1 className="text-xl font-semibold">Bienvenido {user?.nombre || 'Ildefonso'}</h1>
        </div>
       
          <button className='py-2 px-4 bg-white/10 rounded-full hover:bg-white/20 transition' onClick={logout}>Irse</button>
        
      </div>
      
      {/* Aquí podrías poner un buscador o dejarlo limpio como tu diseño */}
    </div>
  );
}