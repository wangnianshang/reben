import { supabase } from '../supabaseClient'

// 获取所有笔记（支持关键词和日期筛选）
export const fetchNotes = async (keyword = '', date = '') => {
  try {
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (keyword) {
      // 简单模糊搜索，仅支持 text 类型的 content
      query = query.ilike('content', `%${keyword}%`)
    }

    if (date) {
      // 筛选特定日期的记录
      // 假设 date 格式为 YYYY-MM-DD
      // 为了处理时区问题，我们简单地按日期字符串匹配（如果存储的是 UTC 时间，这里可能需要调整）
      // 更稳健的做法是比较范围
      const startDate = new Date(date)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 1)
      
      query = query
        .gte('created_at', startDate.toISOString())
        .lt('created_at', endDate.toISOString())
    }

    const { data, error } = await query

    if (error) {
      console.error('Supabase error fetching notes:', error)
      throw error
    }

    return data.map(note => ({
      ...note,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }))
  } catch (error) {
    console.error('获取笔记失败:', error)
    // 返回空数组以免崩溃前端
    return []
  }
}

// 创建笔记
export const createNote = async (type, content) => {
  try {
    const newNote = {
      type: type || 'text',
      content,
      // created_at 和 updated_at 由数据库默认值处理
    }

    const { data, error } = await supabase
      .from('notes')
      .insert([newNote])
      .select()

    if (error) {
      console.error('Supabase error creating note:', error)
      throw error
    }

    if (data && data.length > 0) {
      const note = data[0];
      return {
          ...note,
          createdAt: note.created_at,
          updatedAt: note.updated_at
      }
    }
    return null
  } catch (error) {
    console.error('保存笔记失败:', error)
    throw error
  }
}

// 删除笔记
export const deleteNote = async (id) => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase error deleting note:', error)
      throw error
    }

    return { success: true, message: '删除成功' }
  } catch (error) {
    console.error('删除笔记失败:', error)
    throw error
  }
}
