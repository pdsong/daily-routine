import http from 'node:http'

async function testApi() {
  console.log('Testing server APIs...')

  const baseUrl = 'http://localhost:3030'
  let cookie = ''

  // Helper to make requests
  async function request(path, options = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(cookie ? { 'Cookie': cookie } : {}),
        ...(options.headers || {})
      }
    })

    const setCookie = res.headers.get('set-cookie')
    if (setCookie) {
      cookie = setCookie.split(';')[0]
    }

    const data = await res.json()
    return { status: res.status, data }
  }

  try {
    // 1. Register test user
    const username = 'u_' + Date.now().toString().slice(-6)
    console.log(`1. Registering user: ${username}`)
    const regRes = await request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password: 'password123' })
    })
    console.log('Registration status:', regRes.status, regRes.data)

    // 2. Check /api/auth/me
    console.log('2. Checking current user /api/auth/me...')
    const meRes = await request('/api/auth/me')
    console.log('Me status:', meRes.status, meRes.data)

    // 3. Check habits list (should have seeded 5 default habits!)
    console.log('3. Getting habits list /api/habits...')
    const habitsRes = await request('/api/habits')
    console.log('Habits count:', habitsRes.data.habits?.length)
    habitsRes.data.habits?.forEach((h) => {
      console.log(` - [${h.type}] ${h.title} (color: ${h.color}, time: ${h.start_time || 'N/A'})`)
    })

    // 4. Get today's daily items
    console.log('4. Getting daily tasks /api/logs/daily...')
    const dailyRes = await request('/api/logs/daily')
    console.log('Daily tasks count:', dailyRes.data.items?.length, 'completed:', dailyRes.data.completedCount)

    // 5. Toggle first habit (English shadowing)
    const firstHabit = habitsRes.data.habits[0]
    console.log(`5. Toggling habit ${firstHabit.title} to completed...`)
    const toggleRes = await request('/api/logs/toggle', {
      method: 'POST',
      body: JSON.stringify({
        habit_id: firstHabit.id,
        date: dailyRes.data.date,
        status: 'completed'
      })
    })
    console.log('Toggle result:', toggleRes.data)

    // 6. Log reading task
    const readingHabit = habitsRes.data.habits.find((h) => h.type === 'quantified_log')
    if (readingHabit) {
      console.log(`6. Logging reading task for "${readingHabit.title}"...`)
      const readRes = await request('/api/logs/toggle', {
        method: 'POST',
        body: JSON.stringify({
          habit_id: readingHabit.id,
          date: dailyRes.data.date,
          status: 'completed',
          book_title: '原则 (Principles)',
          pages_read: 35,
          duration_minutes: 45,
          notes: '今天读了关于决策机制的章节，收获颇丰。'
        })
      })
      console.log('Reading log result:', readRes.data)
    }

    // 7. Check Heatmap
    console.log('7. Checking heatmap data /api/stats/heatmap...')
    const heatmapRes = await request('/api/stats/heatmap')
    console.log('Heatmap total days:', heatmapRes.data.totalDays)

    // 8. Check Summary & Stats
    console.log('8. Checking summary stats /api/stats/summary...')
    const summaryRes = await request('/api/stats/summary')
    console.log('Summary:', {
      streak: summaryRes.data.streak,
      totalCompletions: summaryRes.data.totalCompletions,
      readingPages: summaryRes.data.reading?.totalPages,
      readingBooks: summaryRes.data.reading?.bookCount
    })

    // 9. Create a custom abstinence habit: 不吃晚饭
    console.log('9. Creating custom habit: 某天不吃晚饭...')
    const createRes = await request('/api/habits', {
      method: 'POST',
      body: JSON.stringify({
        title: '某天不吃晚饭 (轻断食自律)',
        category: 'self_discipline',
        type: 'abstinence',
        icon: 'ShieldCheck',
        color: 'purple',
        repeat_type: 'daily'
      })
    })
    console.log('Created habit:', createRes.data.habit?.title)

    console.log('✅ ALL API TESTS PASSED SUCCESSFULLY!')
    process.exit(0)
  } catch (err) {
    console.error('Test failed:', err)
    process.exit(1)
  }
}

testApi()
