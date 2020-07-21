module.exports = {
  purge: {
    content: ["_site/**/*.html"],
    options: {
      whitelist: [],
    },
  },
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
      },
      fontFamily: {
        'poppins': 'Poppins'
      },
      colors: {
        'custom-gray': '#444',
        'custom-gray-2': '#bbb',
        'custom-black': '#222',
        'custom-blue': '#0001fe',
      },
      minHeight: {
        '60vh': '60vh',
        '90vh': '90vh',
      },
      borderWidth: {
        1: '1px',
        3: '3px',
      },
      borderRadius: {
        2: '2rem',
      },
      opacity: {
        '90': '.9',
      },
      zIndex: {
        '-10': '-10'
      }
    }
  },
  variants: {},
  plugins: [
    require('@tailwindcss/ui'),
    require('@tailwindcss/typography'),
  ]
};
