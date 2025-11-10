// GamePlan Website JavaScript

// Connection to Supabase Database
const SUPABASE_URL = "https://ggsuwucwbnnlspeyxcph.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc3V3dWN3Ym5ubHNwZXl4Y3BoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODgzMjgsImV4cCI6MjA3Nzg2NDMyOH0.Vat3PwtsCocNJkjBy4fdZkl8g6V2aSUgdHstCQvvXvM";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Sample concept library that powers the concept modal
const conceptLibrary = {
    'first-person-controller': {
        title: 'First Person Controller',
        description: 'Core systems for player-controlled movement in a first-person game.',
        engines: {
            unity: {
                title: 'Unity Implementation',
                summary: 'Uses `CharacterController` for smooth movement with mouse look support.',
                code: `public class FirstPersonController : MonoBehaviour
{
    public float moveSpeed = 5f;
    public float lookSensitivity = 2f;
    private CharacterController controller;
    private float rotationX;

    void Start()
    {
        controller = GetComponent<CharacterController>();
        Cursor.lockState = CursorLockMode.Locked;
    }

    void Update()
    {
        float moveX = Input.GetAxis("Horizontal");
        float moveZ = Input.GetAxis("Vertical");

        Vector3 move = transform.right * moveX + transform.forward * moveZ;
        controller.SimpleMove(move * moveSpeed);

        rotationX -= Input.GetAxis("Mouse Y") * lookSensitivity;
        rotationX = Mathf.Clamp(rotationX, -80f, 80f);
        transform.localRotation *= Quaternion.Euler(0f, Input.GetAxis("Mouse X") * lookSensitivity, 0f);
        Camera.main.transform.localRotation = Quaternion.Euler(rotationX, 0f, 0f);
    }
}`,
                links: [
                    { label: 'Unity Docs: CharacterController', url: 'https://docs.unity3d.com/ScriptReference/CharacterController.html' }
                ]
            },
            unreal: {
                title: 'Unreal Engine Implementation',
                summary: 'Leverages `CharacterMovementComponent` with enhanced input bindings.',
                code: `void APlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    PlayerInputComponent->BindAxis("MoveForward", this, &APlayerCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &APlayerCharacter::MoveRight);
    PlayerInputComponent->BindAxis("Turn", this, &APawn::AddControllerYawInput);
    PlayerInputComponent->BindAxis("LookUp", this, &APawn::AddControllerPitchInput);
}

void APlayerCharacter::MoveForward(float Value)
{
    if (Controller && Value != 0.0f)
    {
        const FRotator Rotation = Controller->GetControlRotation();
        const FVector Direction = FRotationMatrix(Rotation).GetUnitAxis(EAxis::X);
        AddMovementInput(Direction, Value);
    }
}`,
                links: [
                    { label: 'Unreal Docs: CharacterMovementComponent', url: 'https://docs.unrealengine.com/5.0/en-US/character-movement-component-in-unreal-engine/' }
                ]
            },
            godot: {
                title: 'Godot Implementation',
                summary: 'Implements `CharacterBody3D` with camera pitch clamping.',
                code: `extends CharacterBody3D

@export var move_speed := 5.0
@export var look_sensitivity := 0.002

var pitch := 0.0

func _ready():
    Input.set_mouse_mode(Input.MOUSE_MODE_CAPTURED)

func _physics_process(delta):
    var input_dir = Vector2(
        Input.get_action_strength("move_right") - Input.get_action_strength("move_left"),
        Input.get_action_strength("move_backward") - Input.get_action_strength("move_forward")
    )
    input_dir = input_dir.normalized()
    var direction = (transform.basis * Vector3(input_dir.x, 0, input_dir.y)).normalized()
    velocity.x = direction.x * move_speed
    velocity.z = direction.z * move_speed
    move_and_slide()

func _input(event):
    if event is InputEventMouseMotion:
        rotate_y(-event.relative.x * look_sensitivity)
        pitch = clamp(pitch - event.relative.y * look_sensitivity, deg_to_rad(-80), deg_to_rad(80))
        $Camera3D.rotation.x = pitch`,
                links: [
                    { label: 'Godot Docs: CharacterBody3D', url: 'https://docs.godotengine.org/en/stable/classes/class_characterbody3d.html' }
                ]
            }
        },
        comments: [
            { author: 'Jamie L.', role: 'Unity Dev', time: '2 days ago', text: 'Swapping in Cinemachine made the camera smoothing even better. Worth trying if you need advanced camera blending.' },
            { author: 'Priya S.', role: 'Technical Designer', time: '5 days ago', text: 'If you enable sprinting, remember to adjust mouse sensitivity so it feels consistent.' }
        ]
    },
    'health-system': {
        title: 'Health System',
        description: 'Modular health, damage, and death handling for characters.',
        engines: {
            unity: {
                title: 'Unity Implementation',
                summary: 'ScriptableObject-driven health config with event callbacks.',
                code: `public class Health : MonoBehaviour
{
    public int maxHealth = 100;
    public UnityEvent onZeroHealth;

    private int currentHealth;

    void Awake()
    {
        currentHealth = maxHealth;
    }

    public void ApplyDamage(int amount)
    {
        currentHealth = Mathf.Max(currentHealth - amount, 0);
        if (currentHealth == 0)
        {
            onZeroHealth?.Invoke();
        }
    }

    public void Heal(int amount)
    {
        currentHealth = Mathf.Min(currentHealth + amount, maxHealth);
    }
}`,
                links: [
                    { label: 'Unity Events Overview', url: 'https://docs.unity3d.com/Manual/UnityEvents.html' }
                ]
            },
            unreal: {
                title: 'Unreal Engine Implementation',
                summary: 'Component-based health with BlueprintAssignable delegates.',
                code: `UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class UHealthComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UPROPERTY(EditDefaultsOnly, BlueprintReadWrite, Category="Health")
    float MaxHealth = 100.f;

    UPROPERTY(BlueprintReadOnly, Category="Health")
    float CurrentHealth;

    UPROPERTY(BlueprintAssignable, Category="Health")
    FOnHealthZero OnHealthZero;

    virtual void BeginPlay() override
    {
        Super::BeginPlay();
        CurrentHealth = MaxHealth;
    }

    void ApplyDamage(float DamageAmount)
    {
        CurrentHealth = FMath::Clamp(CurrentHealth - DamageAmount, 0.f, MaxHealth);
        if (CurrentHealth <= 0.f)
        {
            OnHealthZero.Broadcast();
        }
    }
};`,
                links: [
                    { label: 'Delegates in Unreal', url: 'https://docs.unrealengine.com/5.0/en-US/delegates-in-unreal-engine/' }
                ]
            },
            godot: {
                title: 'Godot Implementation',
                summary: 'Signals emit health changes for UI and gameplay systems.',
                code: `extends Node

signal health_changed(current, max)
signal health_depleted

@export var max_health := 100
var current_health := max_health

func apply_damage(amount: int) -> void:
    current_health = max(current_health - amount, 0)
    emit_signal("health_changed", current_health, max_health)
    if current_health == 0:
        emit_signal("health_depleted")

func heal(amount: int) -> void:
    current_health = min(current_health + amount, max_health)
    emit_signal("health_changed", current_health, max_health)`,
                links: [
                    { label: 'Godot Signals Guide', url: 'https://docs.godotengine.org/en/stable/tutorials/scripting/signals.html' }
                ]
            }
        },
        comments: [
            { author: 'Morgan K.', role: 'Gameplay Programmer', time: '1 day ago', text: 'I wired the Unreal delegate into a widget to trigger a slow-motion effect on death. Super flexible setup!' },
            { author: 'Chen W.', role: 'UI Engineer', time: '1 week ago', text: 'In Unity, consider raising an event when health crosses certain thresholds to update status effects.' }
        ]
    },
    'platformer-physics': {
        title: '2D Platformer Physics',
        description: 'Responsive platformer movement with jump buffering and coyote time.',
        engines: {
            unity: {
                title: 'Unity Implementation',
                summary: 'Uses Rigidbody2D with custom state tracking for coyote time.',
                code: `public class PlatformerController : MonoBehaviour
{
    public float moveSpeed = 8f;
    public float jumpForce = 14f;
    public float coyoteTime = 0.15f;
    public float jumpBufferTime = 0.1f;

    private Rigidbody2D rb;
    private float coyoteTimer;
    private float jumpBufferTimer;

    void Awake() => rb = GetComponent<Rigidbody2D>();

    void Update()
    {
        float moveInput = Input.GetAxisRaw("Horizontal");
        rb.velocity = new Vector2(moveInput * moveSpeed, rb.velocity.y);

        if (IsGrounded())
        {
            coyoteTimer = coyoteTime;
        }
        else
        {
            coyoteTimer -= Time.deltaTime;
        }

        if (Input.GetButtonDown("Jump"))
        {
            jumpBufferTimer = jumpBufferTime;
        }
        else
        {
            jumpBufferTimer -= Time.deltaTime;
        }

        if (coyoteTimer > 0 && jumpBufferTimer > 0)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
            jumpBufferTimer = 0;
        }
    }

    bool IsGrounded() => Physics2D.Raycast(transform.position, Vector2.down, 0.1f, LayerMask.GetMask("Ground"));
}`,
                links: [
                    { label: 'Unity Docs: Rigidbody2D', url: 'https://docs.unity3d.com/ScriptReference/Rigidbody2D.html' }
                ]
            },
            unreal: {
                title: 'Unreal Engine Implementation',
                summary: 'Custom movement mode layered on PaperZD character.',
                code: `void APlatformerCharacter::Tick(float DeltaSeconds)
{
    Super::Tick(DeltaSeconds);
    UpdateCoyoteTime(DeltaSeconds);
    UpdateJumpBuffer(DeltaSeconds);
}

void APlatformerCharacter::HandleJumpInput()
{
    bWantsToJump = true;
    JumpBufferTimeRemaining = JumpBufferDuration;
}

void APlatformerCharacter::TryExecuteJump()
{
    if (CoyoteTimeRemaining > 0.f && JumpBufferTimeRemaining > 0.f)
    {
        Jump();
        JumpBufferTimeRemaining = 0.f;
    }
}`,
                links: [
                    { label: 'Paper2D Platformer Guide', url: 'https://docs.unrealengine.com/5.0/en-US/creating-2d-platformer-game-in-unreal-engine/' }
                ]
            },
            godot: {
                title: 'Godot Implementation',
                summary: 'Combines `move_and_slide` with timers for jump buffering.',
                code: `extends CharacterBody2D

@export var move_speed := 200.0
@export var jump_velocity := -400.0
@export var coyote_time := 0.12
@export var jump_buffer := 0.08

var coyote_timer := 0.0
var buffer_timer := 0.0

func _physics_process(delta):
    var input_direction = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")
    velocity.x = input_direction * move_speed

    if not is_on_floor():
        coyote_timer -= delta
    else:
        coyote_timer = coyote_time

    if Input.is_action_just_pressed("ui_accept"):
        buffer_timer = jump_buffer
    else:
        buffer_timer -= delta

    if coyote_timer > 0 and buffer_timer > 0:
        velocity.y = jump_velocity
        buffer_timer = 0

    velocity.y += 900 * delta
    move_and_slide()`,
                links: [
                    { label: 'Godot Docs: CharacterBody2D', url: 'https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html' }
                ]
            }
        },
        comments: [
            { author: 'Liam R.', role: 'Indie Dev', time: '4 hours ago', text: 'Tuning gravity is key—try incrementally increasing it until the jumps feel snappy.' },
            { author: 'Mina P.', role: 'Godot Contributor', time: '3 days ago', text: 'If you add variable jump height, clamp the upward velocity so players can feather jumps.' }
        ]
    }
};

const commentStore = {};

// Wait for the page to load completely before running our code
document.addEventListener('DOMContentLoaded', function() {

    // Set up all the interactive features
    setupMobileMenu();
    setupBrowseFilters();
    setupSearch();
    setupConceptModal();
    setupButtons();
});

// MOBILE MENU - Makes the hamburger menu work on phones.
function setupMobileMenu() {
    // Find the hamburger button and menu
    const hamburger = document.querySelector('.hamburger');
    const menu = document.querySelector('.nav-menu');

    // Only run if both elements exist on the page
    if (hamburger && menu) {
        // When hamburger is clicked, show/hide menu
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            menu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const menuLinks = document.querySelectorAll('.nav-link');
        menuLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                menu.classList.remove('active');
            });
        });
    }
}

// BROWSE FILTERS - Filter code examples by engine and category
function setupBrowseFilters() {
    // Find the filter dropdowns and examples grid
    const engineFilter = document.getElementById('engine-filter');
    const categoryFilter = document.getElementById('category-filter');
    const examplesGrid = document.getElementById('examples-grid');

    // Only run if we're on the browse page
    if (engineFilter && categoryFilter && examplesGrid) {

        // Function to filter the examples
        function filterExamples() {
            const selectedEngine = engineFilter.value;
            const selectedCategory = categoryFilter.value;
            const allExamples = examplesGrid.querySelectorAll('.example-card');

            // Go through each example card
            allExamples.forEach(function(example) {
                const cardEngine = example.getAttribute('data-engine');
                const cardCategory = example.getAttribute('data-category');

                // Check if this card matches the selected filters
                const engineMatches = (selectedEngine === 'all' || cardEngine === selectedEngine);
                const categoryMatches = (selectedCategory === 'all' || cardCategory === selectedCategory);

                // Show or hide the card based on filters
                if (engineMatches && categoryMatches) {
                    example.style.display = 'block';
                } else {
                    example.style.display = 'none';
                }
            });
        }

        // Run filter when dropdowns change
        engineFilter.addEventListener('change', filterExamples);
        categoryFilter.addEventListener('change', filterExamples);

        // Check if URL has an engine parameter (like ?engine=unity)
        const urlParams = new URLSearchParams(window.location.search);
        const engineFromUrl = urlParams.get('engine');
        if (engineFromUrl) {
            engineFilter.value = engineFromUrl;
            filterExamples();
        }
    }
}

// SEARCH FUNCTIONALITY - Search through code examples
function setupSearch() {
    // Find search elements
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-btn');
    const resultsArea = document.getElementById('search-results-grid');
    const resultsInfo = document.getElementById('results-info');
    const resultsCount = document.getElementById('results-count');
    const noResults = document.getElementById('no-results');

    // Only run if we're on the search page
    if (!searchInput || !searchButton || !resultsArea) return;

    // Initialize SearchManager with Strategy
    const dataSource = new SampleDataStrategy(); // Default to sample data
    const searchManager = new SearchManager(dataSource);
    searchManager.initialize({
        searchInput,
        resultsArea,
        resultsInfo,
        resultsCount,
        noResults
    });

    // Optional: Switch to API if backend is ready
    // Uncomment when database/README.md steps are complete:
    // searchManager.setDataSource(new APIDataStrategy('/api/search'));

    // Function to perform the search
    function doSearch() {
        const query = searchInput.value;
        searchManager.search(query); // Async, returns Promise
    }

    // Set up search button click
    searchButton.addEventListener('click', doSearch);

    // Set up search when Enter key is pressed
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            doSearch();
        }
    });

    // Set up suggestion tags (quick search buttons)
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(function(tag) {
        tag.addEventListener('click', function() {
            const searchTerm = this.getAttribute('data-search');
            searchInput.value = searchTerm;
            doSearch();
        });
    });
}

// BUTTON INTERACTIONS - Handle View Code and Download buttons
function setupButtons() {
    // Find all buttons on the page
    const allButtons = document.querySelectorAll('.btn');

    allButtons.forEach(function(button) {
        const buttonText = button.textContent;

        // Only handle View Code and Download buttons
        if (buttonText.includes('Download')) {

            // Remove any existing click handlers to avoid duplicates
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add click handler to the new button
            newButton.addEventListener('click', function(e) {
                e.preventDefault(); // Don't follow any links

                const originalText = this.textContent;

                // Show loading state
                this.textContent = 'Loading...';
                this.disabled = true;

                // After 1 second, show placeholder message
                setTimeout(function() {
                    newButton.textContent = originalText;
                    newButton.disabled = false;
                    alert('This feature will be available when the database is connected!');
                }, 1000);
            });
        }
    });
}

// CONCEPT MODAL - Opens detailed concept view with engine switcher
function setupConceptModal() {
    const modal = document.getElementById('concept-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.modal-overlay');
    const closeButtons = modal.querySelectorAll('[data-close-modal]');
    const titleEl = modal.querySelector('#concept-title');
    const descriptionEl = modal.querySelector('#concept-description');
    const engineTabs = modal.querySelectorAll('.engine-tab');
    const engineTitleEl = modal.querySelector('#engine-title');
    const engineSummaryEl = modal.querySelector('#engine-summary');
    const engineCodeEl = modal.querySelector('#engine-code');
    const engineLinksEl = modal.querySelector('#engine-links');
    const commentsListEl = modal.querySelector('#comments-list');
    const commentFormEl = modal.querySelector('#comment-form');
    const commentInputEl = modal.querySelector('#comment-input');
    let activeConcept = null;
    let activeEngine = 'unity';

    function setModalVisibility(isVisible) {
        modal.setAttribute('aria-hidden', String(!isVisible));
        modal.classList.toggle('open', isVisible);
        document.body.classList.toggle('modal-open', isVisible);
    }

    function updateEngineTabs() {
        engineTabs.forEach(function(tab) {
            const isActive = tab.dataset.engine === activeEngine;
            tab.classList.toggle('active', isActive);
            tab.setAttribute('aria-selected', String(isActive));
        });
    }

    function renderEnginePanel() {
        if (!activeConcept) return;

        const concept = conceptLibrary[activeConcept];
        const engineContent = concept?.engines?.[activeEngine];

        if (!engineContent) {
            engineTitleEl.textContent = 'Engine data unavailable';
            engineSummaryEl.textContent = 'This concept is not yet documented for the selected engine.';
            engineCodeEl.textContent = '// Coming soon';
            engineLinksEl.innerHTML = '';
            return;
        }

        engineTitleEl.textContent = engineContent.title;
        engineSummaryEl.textContent = engineContent.summary;
        engineCodeEl.textContent = engineContent.code;

        engineLinksEl.innerHTML = '';
        if (Array.isArray(engineContent.links) && engineContent.links.length > 0) {
            engineContent.links.forEach(function(link) {
                const anchor = document.createElement('a');
                anchor.href = link.url;
                anchor.target = '_blank';
                anchor.rel = 'noopener noreferrer';
                anchor.className = 'engine-link';
                anchor.textContent = link.label;
                engineLinksEl.appendChild(anchor);
            });
        }
    }

    function getComments(conceptId) {
        if (!commentStore[conceptId]) {
            const baseComments = conceptLibrary[conceptId]?.comments || [];
            commentStore[conceptId] = baseComments.map(function(comment) {
                return Object.assign({}, comment);
            });
        }
        return commentStore[conceptId];
    }

    function renderComments() {
        if (!commentsListEl || !activeConcept) return;
        const comments = getComments(activeConcept);
        commentsListEl.innerHTML = '';

        if (comments.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'comment-empty';
            emptyState.textContent = 'No comments yet. Be the first to share your insights!';
            commentsListEl.appendChild(emptyState);
            return;
        }

        comments.forEach(function(comment) {
            const card = document.createElement('article');
            card.className = 'comment-card';

            const header = document.createElement('div');
            header.className = 'comment-header';

            const avatar = document.createElement('span');
            avatar.className = 'comment-avatar';
            avatar.textContent = comment.author.charAt(0).toUpperCase();

            const meta = document.createElement('div');
            meta.className = 'comment-meta';

            const nameEl = document.createElement('h5');
            nameEl.textContent = comment.author;

            const roleEl = document.createElement('span');
            roleEl.className = 'comment-role';
            roleEl.textContent = comment.role;

            const timeEl = document.createElement('time');
            timeEl.className = 'comment-time';
            timeEl.textContent = comment.time;

            meta.appendChild(nameEl);
            meta.appendChild(roleEl);
            header.appendChild(avatar);
            header.appendChild(meta);
            header.appendChild(timeEl);

            const body = document.createElement('p');
            body.className = 'comment-body';
            body.textContent = comment.text;

            card.appendChild(header);
            card.appendChild(body);
            commentsListEl.appendChild(card);
        });
    }

    function resetCommentForm() {
        if (commentFormEl) {
            commentFormEl.reset();
        }
    }

    function openConcept(conceptId, preferredEngine) {
        const concept = conceptLibrary[conceptId];
        if (!concept) {
            alert('Concept details are coming soon!');
            return;
        }

        activeConcept = conceptId;
        activeEngine = preferredEngine || 'unity';

        titleEl.textContent = concept.title;
        descriptionEl.textContent = concept.description;

        updateEngineTabs();
        renderEnginePanel();
        renderComments();
        resetCommentForm();
        setModalVisibility(true);
    }

    // Hook up engine tab switching
    engineTabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            const newEngine = tab.dataset.engine;
            if (!activeConcept || newEngine === activeEngine) return;

            const concept = conceptLibrary[activeConcept];
            if (!concept?.engines?.[newEngine]) {
                alert('Engine version coming soon!');
                return;
            }

            activeEngine = newEngine;
            updateEngineTabs();
            renderEnginePanel();
        });
    });

    // Hook up close buttons and overlay
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            setModalVisibility(false);
        });
    });

    if (overlay) {
        overlay.addEventListener('click', function() {
            setModalVisibility(false);
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('open')) {
            setModalVisibility(false);
        }
    });

    if (commentFormEl && commentInputEl) {
        commentFormEl.addEventListener('submit', function(event) {
            event.preventDefault();
            if (!activeConcept) return;

            const text = commentInputEl.value.trim();
            if (!text) return;

            const comments = getComments(activeConcept);
            comments.unshift({
                author: 'Alex Mercer',
                role: 'Creator',
                time: 'Just now',
                text: text
            });

            renderComments();
            resetCommentForm();
        });
    }

    // Connect example cards to modal
    const conceptButtons = document.querySelectorAll('[data-open-concept]');
    conceptButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const card = button.closest('.example-card');
            if (!card) return;

            const conceptId = card.getAttribute('data-concept');
            const defaultEngine = card.getAttribute('data-engine');
            openConcept(conceptId, defaultEngine);
        });
    });
}
