import { useState } from 'react';
import axios from 'axios';
import { FormApi } from 'final-form';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export const useCep = (form: FormApi<any>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddressByCep = async (cep: string) => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
      setError('Invalid CEP format.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.get<ViaCepResponse>(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      
      if (data.erro) {
        setError('CEP not found.');
        form.batch(() => {
          form.change('street', '');
          form.change('city', '');
          form.change('state', '');
        });
      } else {
        form.batch(() => {
          form.change('street', data.logradouro);
          form.change('city', data.localidade);
          form.change('state', data.uf);
        });
      }
    } catch (err) {
      setError('Failed to fetch address from CEP.');
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchAddressByCep, isLoading, error };
};
