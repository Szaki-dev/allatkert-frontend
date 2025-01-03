import './index.scss'

// Types for our data
interface Animal {
  id: number
  name: string
  species: string
  age: number
}

interface SpeciesCount {
  _count: number
  species: string
}

// API functions
const API_BASE_URL = 'http://localhost:3000'

async function fetchAnimals(): Promise<Animal[]> {
  const response = await fetch(`${API_BASE_URL}/animals`)
  if (!response.ok) throw new Error('Failed to fetch animals')
  return response.json()
}

async function fetchSpeciesCount(): Promise<SpeciesCount[]> {
  const response = await fetch(`${API_BASE_URL}/animals/bySpecies`)
  if (!response.ok) throw new Error('Failed to fetch species count')
  return response.json()
}

async function deleteAnimal(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/animals/${id}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete animal')
}

async function addAnimal(animal: Omit<Animal, 'id'>): Promise<Animal> {
  const response = await fetch(`${API_BASE_URL}/animals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(animal)
  })
  if (!response.ok) {
    const json = await response.json()
    const errorMessage = json.message.join(', ')
    throw new Error(errorMessage)
  }
  return response.json()
}

// UI update functions
function updateAnimalsList(animals: Animal[]) {
  const tbody = document.getElementById('animal-rows')!
  const count = document.getElementById('animal-count')!

  tbody.innerHTML = animals
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (animal) => `
        <tr>
          <td>${animal.name}</td>
          <td>${animal.species}</td>
          <td>${animal.age}</td>
          <td>
            <button onclick="handleDelete(${animal.id})" class="delete-button">
              <i class="fa-solid fa-trash"></i> Törlés
            </button>
          </td>
        </tr>
      `
    )
    .join('')

  count.textContent = animals.length.toString()
}

function updateSpeciesList(speciesCounts: SpeciesCount[]) {
  const tbody = document.getElementById('species-rows')!
  const count = document.getElementById('species-count')!

  tbody.innerHTML = speciesCounts
    .sort((a, b) => b._count - a._count)
    .map(
      (count) => `
        <tr>
          <td>${count.species}</td>
          <td class="text-right">${count._count}</td>
        </tr>
      `
    )
    .join('')

  count.textContent = speciesCounts.length.toString()
}

// Event handlers
declare global {
  interface Window {
    handleDelete: (id: number) => Promise<void>
  }
}

async function handleDelete(id: number) {
  await deleteAnimal(id)
  await refreshData()
}

function showError(message: string) {
  const errorElement = document.getElementById('error-message')!
  errorElement.textContent = message
  setTimeout(() => {
    errorElement.textContent = ''
  }, 3000)
}

async function handleNewAnimal(event: Event) {
  event.preventDefault()

  const form = event.target as HTMLFormElement
  const formData = new FormData(form)

  const name = formData.get('name') as string
  const species = formData.get('species') as string
  const age = parseInt(formData.get('age') as string)

  if (!name || !species || isNaN(age)) {
    showError('Please fill in all fields')
    return
  }

  try {
    await addAnimal({ name, species, age })
    form.reset()
    await refreshData()
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An error occurred'
    showError(errorMessage)
  }
}

// Data refresh function
async function refreshData() {
  const [animals, speciesCounts] = await Promise.all([
    fetchAnimals(),
    fetchSpeciesCount()
  ])
  updateAnimalsList(animals)
  updateSpeciesList(speciesCounts)
}

// Initialize
function initialize() {
  const form = document.getElementById('new-animal-form')!
  form.addEventListener('submit', handleNewAnimal)

  window.handleDelete = handleDelete

  refreshData()
}

document.addEventListener('DOMContentLoaded', initialize)
