import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cjpfcxspgnlnbbhjeorz.supabase.co';
const supabaseKey = 'sb_publishable_vmP6spcg2757CNDVzJr86g_YfATLqE9';
const supabase = createClient(supabaseUrl, supabaseKey);

async function insertUser() {
    const { data, error } = await supabase
        .from('acessos')
        .insert([
            {
                nome: 'Bruna Gomes',
                email: 'brunagomes2203@gmail.com',
                senha: 'cadastrar',
                nivel: 'assistente administrativo'
            }
        ])
        .select();

    if (error) {
        console.error('Erro ao cadastrar:', error);
    } else {
        console.log('Usuário cadastrado com sucesso!', data);
    }
}

insertUser();
