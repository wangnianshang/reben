import { createClient } from '@supabase/supabase-js';

// 使用之前提供的配置
const supabaseUrl = 'https://behepkehapbxybucqcvt.supabase.co';
const supabaseKey = 'sb_publishable_tjQneQ8du8mqP8URd_1u4g__CSKuuvG';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyTable() {
  console.log('正在验证 Supabase 表结构...');

  try {
    // 1. 尝试插入一条测试数据
    const testContent = 'Test Note ' + Date.now();
    const { data: insertData, error: insertError } = await supabase
      .from('notes')
      .insert([{ type: 'text', content: testContent }])
      .select();

    if (insertError) {
      console.error('❌ 插入失败:', insertError.message);
      if (insertError.code === '42P01') {
        console.error('原因: 找不到 "notes" 表。请确保您已在 SQL Editor 中运行了建表语句。');
      }
      return;
    }

    console.log('✅ 插入成功:', insertData);
    const noteId = insertData[0].id;

    // 2. 尝试查询数据
    const { data: selectData, error: selectError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', noteId);

    if (selectError) {
      console.error('❌ 查询失败:', selectError.message);
      return;
    }

    console.log('✅ 查询成功:', selectData);

    // 3. 清理测试数据
    const { error: deleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', noteId);

    if (deleteError) {
      console.warn('⚠️ 删除测试数据失败:', deleteError.message);
    } else {
      console.log('✅ 清理测试数据成功');
    }

    console.log('\n🎉 验证完成！数据库已准备就绪。');

  } catch (err) {
    console.error('发生异常:', err);
  }
}

verifyTable();
