import { useState } from 'react';
import axios from 'axios';
import { FormApi } from 'final-form';
import { App } from 'antd';

export const useCep = (form: FormApi<any>) => {
  const [isLoading, setIsLoading] = useState(false);
  const { message } = App.useApp();

  const fetchAddressByCep = async (cep: string) => {
    const cleanedCep = cep?.replace(/\D/g, '');
    if (cleanedCep && cleanedCep.length === 8) {
      setIsLoading(true);
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cleanedCep}/json/`);
        if (data.erro) {
          message.error('CEP not found.');
          form.batch(() => {
            form.change('street', undefined);
            form.change('city', undefined);
            form.change('state', undefined);
          })
        } else {
          form.batch(() => {
            form.change('street', data.logradouro);
            form.change('city', data.localidade);
            form.change('state', data.uf);
          });
          message.success('Address loaded from CEP.');
        }
      } catch (error) {
        message.error('Failed to fetch address from CEP.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return { fetchAddressByCep, isLoading };
};
