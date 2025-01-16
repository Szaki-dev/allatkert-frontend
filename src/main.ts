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

function updateAnimalsList(animals: Animal[]) {
  const template = document.getElementById('animalRow') as HTMLTemplateElement
  const tbody = document.getElementById('animal-rows')!
  tbody.innerHTML = ''
  animals.map(
      (animal) => {
        const clone = document.importNode(template.content, true)
        const tds = clone.querySelectorAll('td')
        tds[0].textContent = animal.name
        tds[1].textContent = animal.species
        tds[2].textContent = animal.age.toString()
        tds[3].querySelector('button')!.addEventListener('click', () => handleDelete(animal.id))
        tbody.appendChild(clone)
      }
    )
}

function updateSpeciesList(speciesCounts: SpeciesCount[]) {
  const template = document.getElementById('speciesRow') as HTMLTemplateElement
  const tbody = document.getElementById('species-rows')!
  tbody.innerHTML = ''
  speciesCounts.map(
      (speciesCount) => {
        const clone = document.importNode(template.content, true)
        const tds = clone.querySelectorAll('td')
        tds[0].textContent = speciesCount.species
        tds[1].textContent = speciesCount._count.toString()
        tbody.appendChild(clone)
      }
    )
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
    showError('Khm, mindent tölts ki!')
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

async function refreshData() {
  const [animals, speciesCounts] = await Promise.all([
    fetchAnimals(),
    fetchSpeciesCount()
  ])
  updateAnimalsList(animals)
  updateSpeciesList(speciesCounts)
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('newAnimalForm')!
  form.addEventListener('submit', handleNewAnimal)

  refreshData()
})
