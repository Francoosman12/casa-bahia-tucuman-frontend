import React from "react";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaInstagram,
  FaFacebook,
  FaClock,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logo from "../../assets/casa-bahia.png";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6 mt-auto">
      <div className="container mx-auto px-4">
        {/* GRILLA DE INFO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-800 pb-8">
          {/* 1. BRANDING */}
          <div>
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="Casa Bahía Logo"
                className="h-20 w-auto object-contain" // h-10 (40px) es un buen tamaño para navbar
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed pt-5">
              Amoblamientos y confort para tu hogar en Tucumán. Calidad
              garantizada y la mejor financiación directa.
            </p>
          </div>

          {/* 2. LINKS RÁPIDOS */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-indigo-400">
              Atención al Cliente
            </h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Preguntas Frecuentes
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Información de Envíos
                </span>
              </li>
            </ul>
          </div>

          {/* 3. CONTACTO */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-indigo-400">
              Contáctanos
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-300">
                <FaClock className="mt-1 text-indigo-100" />
                <span className="text-sm">
                  Horario de Atención: Lunes a Sabado de 8:30 a 13:00
                </span>
              </li>
              <li className="flex items-start gap-3 text-gray-300">
                <FaMapMarkerAlt className="mt-1 text-indigo-500" />
                <span className="text-sm">
                  Silvano Bores 850, San Miguel de Tucumán
                  <br />
                  Tucumán, Argentina
                </span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <FaWhatsapp className="text-green-500 text-lg" />
                <a
                  href="https://wa.me/5493815225633"
                  target="_blank"
                  className="text-sm hover:text-green-400 transition-colors font-semibold"
                >
                  +54 9 381 522-5633
                </a>
              </li>
            </ul>

            {/* REDES */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.facebook.com/share/1Dt2qANu6c/"
                className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://www.instagram.com/bahia.hogar?igsh=MXA1eXJzcXI0YjhoNg=="
                className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors"
              >
                <FaInstagram size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="text-center text-gray-600 text-xs flex flex-col md:flex-row justify-between items-center">
          <p>
            &copy; {new Date().getFullYear()} Casa Bahia Tucumán. Todos los
            derechos reservados.
          </p>
          <p className="mt-2 md:mt-0">
            Desarrollado con{" "}
            <a href="https://portfolio-francoosman.vercel.app/">Devos</a> 🚀
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
