const { createClient } =require("@supabase/supabase-js");
const supabaseUrl = 'https://qxvuqmzydpwwqvldclve.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dnVxbXp5ZHB3d3F2bGRjbHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MjE1NjAwNCwiZXhwIjoxOTg3NzMyMDA0fQ.P5kK_j5vTzKzNcEZOVEkOqIMmAetTFEND7Q7PCTYTnI"
const supabase = createClient(supabaseUrl, supabaseKey);

exports.AddNewPayment=async function(amount,payment_id)
{
    const {data,error}= await supabase
    .from('payment-requests-psp')
    .insert(
      {id:payment_id,amount:amount}
      )
  .single();
  return data;

}
exports.GetAmount=async function(payment_id)
{
    const {data,error}= await supabase
    .from('payment-requests-psp')
    .select()
    .eq('id',payment_id);
    console.log(data);
    return data;
}
