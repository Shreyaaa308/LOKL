import { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { addDoc, collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { getLocalMessages, saveLocalMessage, updateLocalApplicationStatus } from '../accountStore'

const statusColor = {
  pending: '#f0a500',
  approved: '#10b981',
  rejected: '#e57373',
}

const formatTime = (value) => {
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ApplicationChat({
  application,
  currentRole,
  currentUserId,
  currentUserName,
  onStatusChange,
  theme: t,
}) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)

  const canAccess = useMemo(() => {
    if (!application) return false
    if (currentRole === 'brand') return application.brandId === currentUserId
    return application.creatorId === currentUserId
  }, [application, currentRole, currentUserId])

  useEffect(() => {
    if (!application?.id || !canAccess) {
      return undefined
    }

    const messageQuery = query(collection(db, 'messages'), where('applicationId', '==', application.id))
    const unsubscribe = onSnapshot(
      messageQuery,
      (snap) => {
        const firebaseMessages = snap.docs.map((messageDoc) => ({ id: messageDoc.id, ...messageDoc.data() }))
        const localMessages = getLocalMessages(application.id)
        const seenIds = new Set(firebaseMessages.map((message) => message.id))
        const merged = [
          ...firebaseMessages,
          ...localMessages.filter((message) => !seenIds.has(message.id)),
        ].sort((a, b) => {
          const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return aTime - bTime
        })
        setMessages(merged)
      },
      (error) => {
        console.error('Firestore messages fetch failed, using local messages:', error)
        setMessages(getLocalMessages(application.id))
      }
    )

    return unsubscribe
  }, [application?.id, canAccess])

  if (!application) return null

  if (!canAccess) {
    return (
      <div style={{ color: t.muted, fontSize: '13px', padding: '20px' }}>
        This conversation is only available to the brand and creator on this application.
      </div>
    )
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    const message = {
      applicationId: application.id,
      campaignId: application.campaignId,
      brandId: application.brandId,
      creatorId: application.creatorId,
      senderId: currentUserId,
      senderRole: currentRole,
      senderName: currentUserName,
      text,
      createdAt: new Date(),
    }

    setSending(true)
    setDraft('')
    try {
      const ref = await addDoc(collection(db, 'messages'), message)
      saveLocalMessage({ ...message, id: ref.id })
    } catch (error) {
      console.warn('Firebase message save failed, saving message locally:', error)
      const localMessage = saveLocalMessage(message)
      setMessages((current) => [...current, localMessage])
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (status) => {
    setStatusSaving(true)
    try {
      await updateDoc(doc(db, 'applications', application.id), {
        status,
        statusUpdatedAt: new Date(),
      })
    } catch (error) {
      console.warn('Firebase status update failed, updating local application status:', error)
    } finally {
      updateLocalApplicationStatus(application.id, status)
      onStatusChange?.(application.id, status)
      setStatusSaving(false)
    }
  }

  return (
    <div style={{
      background: t.card,
      border: `1.5px solid ${t.border}`,
      borderRadius: '14px',
      padding: '16px',
      boxShadow: t.shadow,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '15px' }}>{application.creatorName} / {application.brandName}</div>
          <div style={{ color: t.muted, fontSize: '12px', marginTop: '3px' }}>{application.campaignTitle}</div>
        </div>
        <span style={{
          background: statusColor[application.status] || statusColor.pending,
          color: 'white',
          borderRadius: '20px',
          padding: '4px 10px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
        }}>{application.status || 'pending'}</span>
      </div>

      {currentRole === 'brand' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
          <button onClick={() => updateStatus('approved')} disabled={statusSaving} style={{
            flex: 1,
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '9px',
            fontWeight: 800,
            cursor: statusSaving ? 'not-allowed' : 'pointer',
          }}>Approve</button>
          <button onClick={() => updateStatus('rejected')} disabled={statusSaving} style={{
            flex: 1,
            background: '#e57373',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '9px',
            fontWeight: 800,
            cursor: statusSaving ? 'not-allowed' : 'pointer',
          }}>Reject</button>
        </div>
      )}

      <div style={{
        background: t.dark ? 'rgba(255,255,255,0.04)' : '#faf5ff',
        border: `1px solid ${t.border}`,
        borderRadius: '10px',
        padding: '12px',
        minHeight: '220px',
        maxHeight: '320px',
        overflowY: 'auto',
        marginBottom: '12px',
      }}>
        {messages.length === 0 ? (
          <div style={{ color: t.muted, textAlign: 'center', paddingTop: '76px', fontSize: '13px' }}>
            No messages yet. Start the conversation here.
          </div>
        ) : messages.map((message) => {
          const mine = message.senderId === currentUserId
          return (
            <div key={message.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}>
              <div style={{
                maxWidth: '78%',
                background: mine ? t.purple : t.inputBg,
                color: mine ? 'white' : t.text,
                border: `1px solid ${mine ? t.purple : t.border}`,
                borderRadius: '10px',
                padding: '9px 11px',
              }}>
                <div style={{ fontSize: '12px', lineHeight: 1.5 }}>{message.text}</div>
                <div style={{ fontSize: '10px', opacity: 0.72, marginTop: '5px' }}>
                  {message.senderName} · {formatTime(message.createdAt)}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '8px' }}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type a message..." style={{
          flex: 1,
          background: t.inputBg,
          color: t.text,
          border: `1.5px solid ${t.border}`,
          borderRadius: '8px',
          padding: '11px 12px',
          outline: 'none',
        }} />
        <button type="submit" disabled={sending || !draft.trim()} style={{
          background: sending || !draft.trim() ? '#6b5f82' : t.purple,
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '0 18px',
          fontWeight: 800,
          cursor: sending || !draft.trim() ? 'not-allowed' : 'pointer',
        }}>Send</button>
      </form>
    </div>
  )
}
