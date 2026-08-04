'use client'

import { useEffect, useState } from 'react'

interface Province {
  name: string
  code: number
}

interface District {
  name: string
  code: number
}

interface Ward {
  name: string
  code: number
}

interface AddressSelectorProps {
  value: string
  onChange: (fullAddress: string) => void
}

export default function AddressSelector({ value, onChange }: AddressSelectorProps) {
  const [provinces, setProvinces] = useState<Province[]>([])
  const [districts, setDistricts] = useState<District[]>([])
  const [wards, setWards] = useState<Ward[]>([])

  const [selectedProvince, setSelectedProvince] = useState('')
  const [selectedDistrict, setSelectedDistrict] = useState('')
  const [selectedWard, setSelectedWard] = useState('')
  const [detail, setDetail] = useState('')
  const [manualMode, setManualMode] = useState(false)
  const [manualAddress, setManualAddress] = useState('')

  const [provinceName, setProvinceName] = useState('')
  const [districtName, setDistrictName] = useState('')
  const [wardName, setWardName] = useState('')

  // Parse existing address value on mount
  useEffect(() => {
    if (value && !selectedProvince && !detail && !manualAddress) {
      // Nếu có địa chỉ cũ dạng text → chuyển sang manual mode
      setManualAddress(value)
      setManualMode(true)
    }
  }, [value])

  // Fetch provinces
  useEffect(() => {
    fetch('https://provinces.open-api.vn/api/')
      .then(r => r.json())
      .then(data => setProvinces(data))
      .catch(() => {})
  }, [])

  // Fetch districts khi chọn tỉnh
  useEffect(() => {
    if (!selectedProvince) { setDistricts([]); setWards([]); return }
    fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
      .then(r => r.json())
      .then(data => {
        setDistricts(data.districts || [])
        setProvinceName(data.name || '')
      })
      .catch(() => {})
    setSelectedDistrict('')
    setSelectedWard('')
    setWards([])
    setDistrictName('')
    setWardName('')
  }, [selectedProvince])

  // Fetch wards khi chọn huyện
  useEffect(() => {
    if (!selectedDistrict) { setWards([]); return }
    fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
      .then(r => r.json())
      .then(data => {
        setWards(data.wards || [])
        setDistrictName(data.name || '')
      })
      .catch(() => {})
    setSelectedWard('')
    setWardName('')
  }, [selectedDistrict])

  // Update ward name
  useEffect(() => {
    if (selectedWard) {
      const w = wards.find(w => w.code.toString() === selectedWard)
      setWardName(w?.name || '')
    }
  }, [selectedWard, wards])

  // Combine full address (dropdown mode)
  useEffect(() => {
    if (manualMode) return
    const parts = [detail, wardName, districtName, provinceName].filter(Boolean)
    if (parts.length > 0) {
      onChange(parts.join(', '))
    }
  }, [detail, wardName, districtName, provinceName, manualMode])

  // Manual mode
  useEffect(() => {
    if (manualMode && manualAddress) {
      onChange(manualAddress)
    }
  }, [manualAddress, manualMode])

  if (manualMode) {
    return (
      <div className="space-y-2">
        <textarea
          value={manualAddress}
          onChange={e => setManualAddress(e.target.value)}
          rows={2}
          placeholder="Nhập đầy đủ địa chỉ: số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          required
        />
        <button type="button" onClick={() => setManualMode(false)}
          className="text-xs text-pink-600 hover:underline">
          ← Chọn từ danh sách
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Row: Tỉnh / Huyện / Xã */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Tỉnh/TP <span className="text-red-400">*</span></label>
          <select
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
          >
            <option value="">Chọn tỉnh</option>
            {provinces.map(p => (
              <option key={p.code} value={p.code}>{p.name.replace('Tỉnh ', '').replace('Thành phố ', '')}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Quận/Huyện <span className="text-red-400">*</span></label>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
            disabled={!selectedProvince}
          >
            <option value="">Chọn huyện</option>
            {districts.map(d => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Phường/Xã <span className="text-red-400">*</span></label>
          <select
            value={selectedWard}
            onChange={e => setSelectedWard(e.target.value)}
            className="w-full px-2 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm bg-white"
            disabled={!selectedDistrict}
          >
            <option value="">Chọn xã</option>
            {wards.map(w => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Địa chỉ cụ thể */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Địa chỉ cụ thể <span className="text-red-400">*</span></label>
        <input
          type="text"
          value={detail}
          onChange={e => setDetail(e.target.value)}
          placeholder="Số nhà, tên đường, ấp/khu phố..."
          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm"
          required
        />
      </div>

      {/* Link chuyển sang nhập tay */}
      <button type="button" onClick={() => { setManualMode(true); setManualAddress(detail ? [detail, wardName, districtName, provinceName].filter(Boolean).join(', ') : '') }}
        className="text-xs text-gray-400 hover:text-pink-600 hover:underline">
        Không tìm thấy địa chỉ? Nhập thủ công →
      </button>
    </div>
  )
}
