import { supabase } from '../supabaseClient'
import { Note, CreateNoteDTO } from '../types'

// 获取所有笔记（支持关键词和日期筛选）
export const fetchNotes = async (keyword: string = '', date: string = ''): Promise<Note[]> => {
  try {
    let query = supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false })

    if (keyword) {
      // 简单模糊搜索，支持 text 类型的 content 或 description
      query = query.or(`content.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    }

    if (date) {
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

    return (data as any[]).map(note => ({
      ...note,
      createdAt: note.created_at,
      updatedAt: note.updated_at
    }))
  } catch (error) {
    console.error('获取笔记失败:', error)
    return []
  }
}

// 创建笔记
export const createNote = async (type: 'text' | 'image', content: string, description?: string): Promise<Note | null> => {
  try {
    const newNote: any = {
      type: type || 'text',
      content,
      description
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
export const deleteNote = async (id: number) => {
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
